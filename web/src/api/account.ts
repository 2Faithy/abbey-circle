import { api } from "./client";
import type { User } from "../types";

export function getMe() {
  return api.get<{ user: User }>("/me").then((r) => r.data.user);
}

export function updateMe(data: Partial<Pick<User, "name" | "company" | "bio" | "phone">>) {
  return api.patch<{ user: User }>("/me", data).then((r) => r.data.user);
}