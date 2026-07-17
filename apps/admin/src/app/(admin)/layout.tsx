"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

const nav = [
  { href: "/users", label: "Users" },
  { href: "/organizations", label: "Organizations" },
  { href: "/ai-config", label: "AI Config" },
  { href: "/analytics", label: "Analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="w-10 h-10 rounded-lg bg-red-600 animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-900">
      <aside className="w-52 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">Aa</span>
            </div>
            <span className="font-semibold text-white text-sm">Super Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 px-3 mb-2 truncate">{user.email}</p>
          <button onClick={logout} className="w-full px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors text-left">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto text-white">{children}</main>
    </div>
  );
}
