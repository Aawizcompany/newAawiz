"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { getOrgId } from "@/lib/org";

type Member = {
  id: string; email: string; role: string; status: string;
  user_id: string | null; display_name: string | null;
  invited_at: string; joined_at: string | null;
};

const roles = ["admin", "hr", "team_lead", "viewer"];
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  invited: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
};

export default function MembersPage() {
  const { token } = useAuth();
  const orgId = getOrgId(token);
  const [members, setMembers] = useState<Member[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { if (orgId) load(); }, [orgId]);

  const load = async () => {
    try { setMembers(await api<Member[]>(`/api/v1/members/${orgId}`, { token: token! })); } catch {}
  };

  const invite = async () => {
    if (!inviteEmail || saving) return;
    setSaving(true);
    try {
      await api(`/api/v1/members/${orgId}/invite`, { method: "POST", body: { email: inviteEmail, role: inviteRole }, token: token! });
      setShowInvite(false);
      setInviteEmail("");
      load();
    } catch {}
    setSaving(false);
  };

  const changeRole = async (memberId: string, role: string) => {
    try {
      await api(`/api/v1/members/${orgId}/${memberId}/role?role=${role}`, { method: "PATCH", body: {}, token: token! });
      load();
    } catch {}
  };

  const suspend = async (memberId: string) => {
    try {
      await api(`/api/v1/members/${orgId}/${memberId}/suspend`, { method: "PATCH", body: {}, token: token! });
      load();
    } catch {}
  };

  const remove = async (memberId: string) => {
    try {
      await api(`/api/v1/members/${orgId}/${memberId}`, { method: "DELETE", token: token! });
      load();
    } catch {}
  };

  const filtered = members.filter((m) => m.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm">{members.length} member{members.length !== 1 ? "s" : ""} in your organization</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
          + Invite member
        </button>
      </div>

      {showInvite && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Invite a new member</h3>
          <div className="flex gap-3">
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="member@company.com" type="email" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]">
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={invite} disabled={saving}
              className="px-4 py-2 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] disabled:opacity-50">
              {saving ? "Sending..." : "Send invite"}
            </button>
            <button onClick={() => setShowInvite(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {members.length > 3 && (
        <div className="mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
            placeholder="Search members..." />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No members yet. Invite your first team member.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3B4B9E] flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{(m.display_name || m.email)[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.display_name || m.email.split("@")[0]}</p>
                        <p className="text-xs text-gray-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}
                      className="text-xs bg-transparent border border-gray-200 rounded px-2 py-1 focus:outline-none">
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[m.status] || "bg-gray-100 text-gray-600"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "Pending"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {m.status === "active" && (
                        <button onClick={() => suspend(m.id)} className="text-xs text-orange-600 hover:text-orange-800 px-2 py-1">Suspend</button>
                      )}
                      <button onClick={() => remove(m.id)} className="text-xs text-red-600 hover:text-red-800 px-2 py-1">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
