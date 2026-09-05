import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export interface AccessTokenPayload {
  userId: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_TTL || "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
  const options: SignOptions = {
    expiresIn: `${days}d` as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}