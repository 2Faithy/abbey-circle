import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Refresh tokens are long random JWTs — we don't need bcrypt's slow hashing,
// just a fast, deterministic hash so we can look them up in the DB.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}