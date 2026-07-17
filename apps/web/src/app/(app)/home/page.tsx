"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type MoodEntry = { id: string; level: number; tags: string[] | null; note: string | null; created_at: string };
type Summary = { entries: MoodEntry[]; average_level: number | null; top_tags: string[]; streak_days: number };

const moods = [
  { level: 1, emoji: "😢", label: "Awful" },
  { level: 2, emoji: "😕", label: "Bad" },
  { level: 3, emoji: "😐", label: "Okay" },
  { level: 4, emoji: "😊", label: "Good" },
  { level: 5, emoji: "😄", label: "Great" },
];

const tagOptions = ["Work", "Relationships", "Health", "Sleep", "Exercise", "Family", "Money", "Weather", "Social", "Creative"];

export default function HomePage() {
  const { token, user } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (token) api<Summary>("/api/v1/moods/summary", { token }).then(setSummary).catch(() => {});
  }, [token]);

  const toggleTag = (t: string) =>
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await api("/api/v1/moods", {
        method: "POST",
        body: { level: selected, tags: tags.length ? tags : null, note: note || null },
        token: token!,
      });
      setSaved(true);
      setSelected(null);
      setTags([]);
      setNote("");
      api<Summary>("/api/v1/moods/summary", { token: token! }).then(setSummary).catch(() => {});
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="pt-2">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs text-gray-400 mb-0.5">
          {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-xl font-semibold text-gray-900">
          Hi {user?.display_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">How are you feeling today?</p>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-100 rounded-2xl">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white fill-none stroke-white" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm text-green-800 font-medium">Mood logged! Keep your streak going.</p>
        </div>
      )}

      {/* Mood picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Log your mood</p>
        <div className="flex gap-2 mb-1">
          {moods.map((m) => (
            <button key={m.level} onClick={() => setSelected(m.level)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                selected === m.level
                  ? "border-[#6366F1] bg-[#EEF2FF] scale-105"
                  : "border-gray-100 bg-gray-50 hover:border-gray-200"
              }`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-medium text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">What&apos;s on your mind?</p>
              <div className="flex flex-wrap gap-1.5">
                {tagOptions.map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      tags.includes(tag)
                        ? "bg-[#6366F1] text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1]"
              rows={2} placeholder="Add a note (optional)..." />

            <button onClick={save} disabled={saving}
              className="w-full py-2.5 bg-[#6366F1] text-white rounded-xl text-sm font-semibold hover:bg-[#4F46E5] disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Log mood"}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
            <p className="text-[10px] text-gray-400 mb-1">🔥 Streak</p>
            <p className="text-xl font-bold text-gray-900">{summary.streak_days}<span className="text-xs font-normal text-gray-400 ml-0.5">d</span></p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
            <p className="text-[10px] text-gray-400 mb-1">Avg mood</p>
            <p className="text-xl font-bold text-gray-900">{summary.average_level ?? "—"}<span className="text-xs font-normal text-gray-400 ml-0.5">/5</span></p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
            <p className="text-[10px] text-gray-400 mb-1">Top tag</p>
            <p className="text-xs font-semibold text-[#6366F1] truncate">{summary.top_tags[0] || "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
