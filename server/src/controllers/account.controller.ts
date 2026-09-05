import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/requireAuth";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
});

export async function getMe(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      company: true,
      bio: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user });
}

export async function updateMe(req: AuthedRequest, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      company: true,
      bio: true,
      phone: true,
      createdAt: true,
    },
  });

  return res.json({ user });
}