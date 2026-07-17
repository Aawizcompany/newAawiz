"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type User = {
  id: string; email: string; display_name: string | null; role: string;
  is_active: boolean; is_verified: boolean; persona: string; streak_days: number; created_at: string;
};

const roleColors: Record<string, string> = {
  super_admin: "bg-red-900 text-red-300",
  org_admin: "bg-blue-900 text-blue-300",
  user: "bg-gray-700 text-gray-300",
};

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => { if (token) load(); }, [token]);

  const load = async () => {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api<{ users: User[]; total: number }>(`/api/v1/admin/users${q}`, { token: token! });
      setUsers(res.users);
      setTotal(res.total);
    } catch {}
  };

  useEffect(() => {
    const t = setTimeout(() => { if (token) load(); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-gray-400 text-sm">{total} total users on the platform</p>
        </div>
      </div>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Search by email..." />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Streak</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{u.display_name || u.email.split("@")[0]}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${roleColors[u.role] || "bg-gray-700 text-gray-300"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {u.is_active ? (
                      <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="text-[10px] bg-red-900 text-red-300 px-2 py-0.5 rounded">Inactive</span>
                    )}
                    {u.is_verified && (
                      <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded">Verified</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{u.streak_days}d</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
