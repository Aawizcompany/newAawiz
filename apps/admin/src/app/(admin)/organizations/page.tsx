"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type Org = {
  id: string; name: string; industry: string | null; country: string | null;
  is_active: boolean; member_count: number; created_at: string;
};

export default function OrganizationsPage() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => { if (token) load(); }, [token]);

  const load = async () => {
    try {
      const res = await api<{ organizations: Org[]; total: number }>("/api/v1/admin/organizations", { token: token! });
      setOrgs(res.organizations);
      setTotal(res.total);
    } catch {}
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <p className="text-gray-400 text-sm">{total} registered organization{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Organization</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Industry</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Country</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Members</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{o.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{o.id.slice(0, 8)}...</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{o.industry || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{o.country || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{o.member_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${o.is_active ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                    {o.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No organizations registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
