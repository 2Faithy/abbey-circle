import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { setAccessToken } from "../api/client";
import * as authApi from "../api/auth";
import { getMe } from "../api/account";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: "LOAN_OFFICER" | "REALTOR" | "CLIENT";
    company?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, try to silently restore the session using the
  // httpOnly refresh cookie (if the user has one from a previous visit)
  useEffect(() => {
    async function restoreSession() {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const me = await getMe();
        setUser(me);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await authApi.login({ email, password });
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      role: "LOAN_OFFICER" | "REALTOR" | "CLIENT";
      company?: string;
    }) => {
      const { accessToken, user } = await authApi.register(data);
      setAccessToken(accessToken);
      setUser(user);
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}