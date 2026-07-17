"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#3B4B9E] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Aa</span>
        </div>
        <span className="text-xl font-semibold text-gray-900">Aawiz</span>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome to Aawiz</h1>
      <p className="text-gray-500 text-sm mb-8">AI-Powered HR Dashboard</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E] focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-sm text-[#3B4B9E] hover:underline">
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E] focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an organization account?{" "}
        <Link href="/register" className="text-[#3B4B9E] hover:underline font-medium">
          Register your organization
        </Link>
      </p>

      <div className="mt-8 flex justify-center gap-6 text-xs text-gray-400">
        <span>Terms of use</span>
        <span>Privacy policy</span>
      </div>
    </div>
  );
}
