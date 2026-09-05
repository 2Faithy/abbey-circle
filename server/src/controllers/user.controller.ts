import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/requireAuth";

export async function listUsers(req: AuthedRequest, res: Response) {
  const search = (req.query.search as string) || "";

  const users = await prisma.user.findMany({
    where: {
      id: { not: req.userId },
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
    },
    take: 20,
  });

  return res.json({ users });
}