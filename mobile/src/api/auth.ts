import { api, setAccessToken, saveRefreshToken, getStoredRefreshToken, clearRefreshToken } from "./client";
import type { User, Role } from "../types";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  role: Role;
  company?: string;
}) {
  const res = await api.post<AuthResponse>("/auth/register", data);
  setAccessToken(res.data.accessToken);
  await saveRefreshToken(res.data.refreshToken);
  return res.data.user;
}

export async function login(email: string, password: string) {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  setAccessToken(res.data.accessToken);
  await saveRefreshToken(res.data.refreshToken);
  return res.data.user;
}

export async function tryRestoreSession(): Promise<User | null> {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await api.post<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      refreshToken,
    });
    setAccessToken(res.data.accessToken);
    await saveRefreshToken(res.data.refreshToken);

    const meRes = await api.get<{ user: User }>("/me");
    return meRes.data.user;
  } catch {
    await clearRefreshToken();
    return null;
  }
}

export async function logout() {
  const refreshToken = await getStoredRefreshToken();
  try {
    await api.post("/auth/logout", { refreshToken });
  } catch {
    // best effort
  }
  setAccessToken(null);
  await clearRefreshToken();
}