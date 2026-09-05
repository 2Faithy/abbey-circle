import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/requireAuth";

// Helper to ensure route parameters are resolved as a single string
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || "";
}

// Send a connection request
export async function sendRequest(req: AuthedRequest, res: Response) {
  const requesterId = req.userId as string;
  const addresseeId = getParam(req.params.userId);

  if (!addresseeId) {
    return res.status(400).json({ error: "Invalid user ID parameter" });
  }

  if (requesterId === addresseeId) {
    return res.status(400).json({ error: "You cannot connect with yourself" });
  }

  const addressee = await prisma.user.findUnique({ where: { id: addresseeId } });
  if (!addressee) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if a connection already exists in either direction
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    },
  });

  if (existing) {
    return res.status(409).json({ error: `Connection already exists (status: ${existing.status})` });
  }

  const connection = await prisma.connection.create({
    data: { requesterId, addresseeId },
  });

  return res.status(201).json({ connection });
}

// Accept a pending request (only the addressee can accept)
export async function acceptRequest(req: AuthedRequest, res: Response) {
  const userId = req.userId as string;
  const connectionId = getParam(req.params.id);

  if (!connectionId) {
    return res.status(400).json({ error: "Invalid connection ID parameter" });
  }

  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection) {
    return res.status(404).json({ error: "Connection not found" });
  }
  if (connection.addresseeId !== userId) {
    return res.status(403).json({ error: "Only the recipient can accept this request" });
  }
  if (connection.status !== "PENDING") {
    return res.status(400).json({ error: `Cannot accept a request with status ${connection.status}` });
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: "ACCEPTED" },
  });

  return res.json({ connection: updated });
}

// Decline a pending request (only the addressee can decline)
export async function declineRequest(req: AuthedRequest, res: Response) {
  const userId = req.userId as string;
  const connectionId = getParam(req.params.id);

  if (!connectionId) {
    return res.status(400).json({ error: "Invalid connection ID parameter" });
  }

  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection) {
    return res.status(404).json({ error: "Connection not found" });
  }
  if (connection.addresseeId !== userId) {
    return res.status(403).json({ error: "Only the recipient can decline this request" });
  }
  if (connection.status !== "PENDING") {
    return res.status(400).json({ error: `Cannot decline a request with status ${connection.status}` });
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: "DECLINED" },
  });

  return res.json({ connection: updated });
}

// List my connections, optionally filtered by status
export async function listConnections(req: AuthedRequest, res: Response) {
  const userId = req.userId as string;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
      ...(status ? { status: status as any } : {}),
    },
    include: {
      requester: { select: { id: true, name: true, email: true, role: true, company: true } },
      addressee: { select: { id: true, name: true, email: true, role: true, company: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ connections });
}