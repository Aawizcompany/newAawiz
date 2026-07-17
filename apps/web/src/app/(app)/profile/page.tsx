"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

const personas = [
  { id: "friend", label: "Friend", desc: "Warm & casual" },
  { id: "coach", label: "Coach", desc: "Motivating & direct" },
  { id: "therapist_style", label: "Therapist", desc: "Calm & reflective" },
  { id: "mentor", label: "Mentor", desc: "Wise & guiding" },
];

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
];

export default function ProfilePage() {
  const { user, token, logout, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [persona, setPersona] = useState(user?.persona || "friend");
  const [language, setLanguage] = useState(user?.language || "en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await api("/api/v1/users/me", {
        method: "PATCH",
        body: { display_name: displayName || null, persona, language },
        token,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (!user) return null;

  const initials = (displayName || user.email)[0].toUpperCase();

  return (
    <div className="pt-2">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">Profile</h1>

      {/* Avatar + info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
          <span className="text-xl font-bold text-[#6366F1]">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{displayName || user.email.split("@")[0]}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs text-[#6366F1] font-medium">🔥 {user.streak_days} day streak</span>
          </div>
        </div>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-2xl">
          <svg className="w-4 h-4 text-green-500 fill-none stroke-green-500" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
          <p className="text-sm text-green-800 font-medium">Profile saved</p>
        </div>
      )}

      {/* Display name */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Display name</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
          placeholder="Your name" />
      </div>

      {/* Persona */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">AI companion style</label>
        <div className="grid grid-cols-2 gap-2">
          {personas.map((p) => (
            <button key={p.id} onClick={() => setPersona(p.id)}
              className={`flex flex-col items-start px-3.5 py-3 rounded-xl border-2 text-left transition-all ${
                persona === p.id ? "border-[#6366F1] bg-[#EEF2FF]" : "border-gray-100 bg-gray-50"
              }`}>
              <p className={`text-sm font-semibold ${persona === p.id ? "text-[#6366F1]" : "text-gray-700"}`}>{p.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Language</label>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((l) => (
            <button key={l.code} onClick={() => setLanguage(l.code)}
              className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border-2 transition-all ${
                language === l.code ? "border-[#6366F1] bg-[#EEF2FF]" : "border-gray-100 bg-gray-50"
              }`}>
              <span className="text-lg">{l.flag}</span>
              <span className={`text-sm font-medium ${language === l.code ? "text-[#6366F1]" : "text-gray-700"}`}>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full py-3 bg-[#6366F1] text-white rounded-xl text-sm font-semibold hover:bg-[#4F46E5] disabled:opacity-50 transition-colors mb-3">
        {saving ? "Saving..." : "Save changes"}
      </button>

      <button onClick={logout}
        className="w-full py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
        Sign out
      </button>
    </div>
  );
}
