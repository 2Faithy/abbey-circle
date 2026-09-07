import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword, hashToken } from "../lib/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { registerSchema, loginSchema } from "../lib/validation";
import crypto from "crypto";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

async function issueTokens(userId: string, res: Response) {
  const tokenId = crypto.randomUUID();
  const refreshToken = signRefreshToken({ userId, tokenId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  const accessToken = signAccessToken({ userId });
  // Web relies on the httpOnly cookie; mobile has no cookie jar, so we also
  // return the refresh token in the JSON body for clients to store themselves.
  setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, name, role, company } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role, company },
  });

  const { accessToken, refreshToken } = await issueTokens(user.id, res);
  return res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = await issueTokens(user.id, res);
  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

export async function refresh(req: Request, res: Response) {
  // Web sends the refresh token via httpOnly cookie; mobile sends it explicitly in the body.
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
  });

  if (!stored || stored.revokedAt || stored.tokenHash !== hashToken(token)) {
    return res.status(401).json({ error: "Refresh token revoked or invalid" });
  }

  // Rotate: revoke the old one, issue a new one
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(payload.userId, res);
  return res.json({ accessToken, refreshToken: newRefreshToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await prisma.refreshToken.updateMany({
        where: { id: payload.tokenId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // token was already invalid/expired — nothing to revoke, ignore
    }
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
  return res.json({ message: "Logged out" });
}