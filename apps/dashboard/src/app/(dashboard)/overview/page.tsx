"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type Overview = {
  total_members: number;
  active_members: number;
  participation_rate: number;
  average_mood: number | null;
  total_teams: number;
  period_days: number;
};

type TeamHealth = { name: string; member_count?: number; participation: number | null; reason?: string };

export default function OverviewPage() {
  const { token } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [teams, setTeams] = useState<TeamHealth[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.org_id) {
        setOrgId(payload.org_id);
        loadData(payload.org_id);
      }
    } catch {}
  }, [token]);

  const loadData = async (oid: string) => {
    try {
      const [overview, teamHealth] = await Promise.all([
        api<Overview>(`/api/v1/reports/org/${oid}/overview`, { token: token! }),
        api<TeamHealth[]>(`/api/v1/reports/org/${oid}/teams`, { token: token! }),
      ]);
      setData(overview);
      setTeams(teamHealth);
    } catch {}
  };

  const healthColor = (p: number) => {
    if (p >= 70) return "bg-green-500";
    if (p >= 50) return "bg-[#3B4B9E]";
    if (p >= 30) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Overview</h1>
      <p className="text-gray-500 text-sm mb-6">Organization health at a glance</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Participation rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">{data ? `${data.participation_rate}%` : "—"}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Active employees</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">{data?.active_members ?? 0}</span>
            <span className="text-sm text-gray-400">/ {data?.total_members ?? 0}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Avg mood score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">{data?.average_mood ?? "—"}</span>
            <span className="text-sm text-gray-400">/ 5</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Teams</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">{data?.total_teams ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team health</h2>
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No teams created yet.</p>
            <p className="text-gray-400 text-sm">Add teams and invite members to see insights here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((t) => (
              <div key={t.name} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-28 truncate">{t.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  {t.participation !== null && (
                    <div className={`h-full rounded-full ${healthColor(t.participation)} transition-all`}
                      style={{ width: `${t.participation}%` }} />
                  )}
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {t.participation !== null ? `${t.participation}%` : "N/A"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
