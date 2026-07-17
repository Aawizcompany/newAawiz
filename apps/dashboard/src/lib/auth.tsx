"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

type User = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; org_name: string; industry?: string; country?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("refresh_token");
    if (t) {
      setToken(t);
      api<User>("/api/v1/users/me", { token: t })
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/org/login",
      { method: "POST", body: { email, password } }
    );
    localStorage.setItem("token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
    setToken(res.access_token);
    const u = await api<User>("/api/v1/users/me", { token: res.access_token });
    setUser(u);
    router.push("/");
  };

  const register = async (data: { email: string; password: string; org_name: string; industry?: string; country?: string }) => {
    const res = await api<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/org/register",
      { method: "POST", body: data }
    );
    localStorage.setItem("token", res.access_token);
    localStorage.setItem("refresh_token", res.refresh_token);
    setToken(res.access_token);
    const u = await api<User>("/api/v1/users/me", { token: res.access_token });
    setUser(u);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
