"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

type User = { id: string; email: string; display_name: string | null; role: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (t) {
      setToken(t);
      api<User>("/api/v1/users/me", { token: t })
        .then((u) => {
          if (u.role !== "super_admin") throw new Error("Not admin");
          setUser(u);
        })
        .catch(() => { localStorage.removeItem("admin_token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/org/login", { method: "POST", body: { email, password } }
    );
    const u = await api<User>("/api/v1/users/me", { token: res.access_token });
    if (u.role !== "super_admin") throw new Error("Super admin access required");
    localStorage.setItem("admin_token", res.access_token);
    setToken(res.access_token);
    setUser(u);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
