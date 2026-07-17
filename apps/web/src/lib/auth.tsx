"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

type User = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  persona: string;
  language: string;
  timezone: string;
  streak_days: number;
  last_check_in: string | null;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  requestOtp: (email: string) => Promise<string | null>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("web_token");
    if (t) {
      setToken(t);
      api<User>("/api/v1/users/me", { token: t })
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("web_token");
          localStorage.removeItem("web_refresh_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const requestOtp = async (email: string) => {
    const res = await api<{ message: string; debug_code: string | null }>(
      "/api/v1/auth/otp/request",
      { method: "POST", body: { email } }
    );
    return res.debug_code;
  };

  const verifyOtp = async (email: string, code: string) => {
    const res = await api<{ access_token: string; refresh_token: string }>(
      "/api/v1/auth/otp/verify",
      { method: "POST", body: { email, code } }
    );
    localStorage.setItem("web_token", res.access_token);
    localStorage.setItem("web_refresh_token", res.refresh_token);
    setToken(res.access_token);
    const u = await api<User>("/api/v1/users/me", { token: res.access_token });
    setUser(u);
    router.push("/home");
  };

  const refreshUser = async () => {
    if (!token) return;
    const u = await api<User>("/api/v1/users/me", { token });
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("web_token");
    localStorage.removeItem("web_refresh_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, requestOtp, verifyOtp, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
