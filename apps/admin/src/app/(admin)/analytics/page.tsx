"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type Stats = { total_users: number; total_organizations: number; active_users: number };

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (token) {
      api<Stats>("/api/v1/admin/stats", { token: token! }).then(setStats).catch(() => {});
    }
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Platform analytics</h1>
      <p className="text-gray-400 text-sm mb-6">Platform-wide usage and health metrics</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-xs text-gray-400 mb-1">Total users</p>
          <p className="text-3xl font-semibold">{stats?.total_users ?? "—"}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-xs text-gray-400 mb-1">Active users</p>
          <p className="text-3xl font-semibold text-green-400">{stats?.active_users ?? "—"}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <p className="text-xs text-gray-400 mb-1">Organizations</p>
          <p className="text-3xl font-semibold text-blue-400">{stats?.total_organizations ?? "—"}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Usage trends</h2>
        <p className="text-gray-500 text-sm text-center py-8">Detailed analytics charts will be added as the platform grows.</p>
      </div>
    </div>
  );
}
