"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/home" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-lg bg-[#3B4B9E] animate-pulse flex items-center justify-center">
        <span className="text-white font-bold text-sm">Aa</span>
      </div>
    </div>
  );
}
