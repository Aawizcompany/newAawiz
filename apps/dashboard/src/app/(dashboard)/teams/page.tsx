"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { getOrgId } from "@/lib/org";

type Team = { id: string; name: string; description: string | null; lead_member_id: string | null; member_count: number; created_at: string };
type Member = { id: string; email: string; display_name: string | null; role: string; status: string };

export default function TeamsPage() {
  const { token } = useAuth();
  const orgId = getOrgId(token);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (orgId) { loadTeams(); loadMembers(); } }, [orgId]);

  const loadTeams = async () => {
    try { setTeams(await api<Team[]>(`/api/v1/teams/${orgId}`, { token: token! })); } catch {}
  };

  const loadMembers = async () => {
    try { setMembers(await api<Member[]>(`/api/v1/members/${orgId}`, { token: token! })); } catch {}
  };

  const createTeam = async () => {
    if (!form.name || saving) return;
    setSaving(true);
    try {
      await api(`/api/v1/teams/${orgId}`, { method: "POST", body: { name: form.name, description: form.description || null }, token: token! });
      setShowCreate(false);
      setForm({ name: "", description: "" });
      loadTeams();
    } catch {}
    setSaving(false);
  };

  const addMember = async (teamId: string, memberId: string) => {
    try {
      await api(`/api/v1/teams/${orgId}/${teamId}/members/${memberId}`, { method: "POST", body: {}, token: token! });
      loadTeams();
    } catch {}
  };

  const removeMember = async (teamId: string, memberId: string) => {
    try {
      await api(`/api/v1/teams/${orgId}/${teamId}/members/${memberId}`, { method: "DELETE", token: token! });
      loadTeams();
    } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Teams</h1>
          <p className="text-gray-500 text-sm">{teams.length} team{teams.length !== 1 ? "s" : ""} in your organization</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
          + Create team
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Create a new team</h3>
          <div className="space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="Team name" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="Description (optional)" />
            <div className="flex gap-2">
              <button onClick={createTeam} disabled={saving}
                className="px-4 py-2 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] disabled:opacity-50">
                {saving ? "Creating..." : "Create team"}
              </button>
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center py-16">
          <p className="text-gray-400">No teams yet. Create your first team to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.id} className={`bg-white rounded-xl border p-5 transition-colors cursor-pointer ${
              selectedTeam === t.id ? "border-[#3B4B9E] ring-1 ring-[#3B4B9E]" : "border-gray-200 hover:border-gray-300"
            }`} onClick={() => setSelectedTeam(selectedTeam === t.id ? null : t.id)}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{t.name}</h3>
                  {t.description && <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>}
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {t.member_count} member{t.member_count !== 1 ? "s" : ""}
                </span>
              </div>

              {selectedTeam === t.id && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-xs text-gray-500 mb-2">Add member to this team:</p>
                  <div className="flex flex-wrap gap-1">
                    {members.filter((m) => m.status === "active").map((m) => (
                      <button key={m.id} onClick={(e) => { e.stopPropagation(); addMember(t.id, m.id); }}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 hover:bg-[#3B4B9E] hover:text-white hover:border-[#3B4B9E] transition-colors">
                        {m.display_name || m.email.split("@")[0]}
                      </button>
                    ))}
                    {members.filter((m) => m.status === "active").length === 0 && (
                      <p className="text-xs text-gray-400">No active members to add. Invite members first.</p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-2">
                Created {new Date(t.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
