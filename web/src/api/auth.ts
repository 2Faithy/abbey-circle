import { api } from "./client";
import type { User, Role } from "../types";

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export function register(data: {
  email: string;
  password: string;
  name: string;
  role: Role;
  company?: string;
}) {
  return api.post<AuthResponse>("/auth/register", data).then((r) => r.data);
}

export function login(data: { email: string; password: string }) {
  return api.post<AuthResponse>("/auth/login", data).then((r) => r.data);
}

export function logout() {
  return api.post("/auth/logout").then((r) => r.data);
}

export function refresh() {
  return api.post<{ accessToken: string }>("/auth/refresh").then((r) => r.data);
}