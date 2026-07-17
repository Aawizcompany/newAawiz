"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type MoodEntry = { id: string; level: number; tags: string[] | null; note: string | null; created_at: string };
type Summary = { entries: MoodEntry[]; average_level: number | null; top_tags: string[]; streak_days: number };

const moods = [
  { level: 1, emoji: "😢", label: "Awful", bg: "bg-red-50 border-red-200", activeBg: "bg-red-100 border-red-400" },
  { level: 2, emoji: "😕", label: "Bad", bg: "bg-orange-50 border-orange-200", activeBg: "bg-orange-100 border-orange-400" },
  { level: 3, emoji: "😐", label: "Okay", bg: "bg-gray-50 border-gray-200", activeBg: "bg-gray-200 border-gray-400" },
  { level: 4, emoji: "😊", label: "Good", bg: "bg-green-50 border-green-200", activeBg: "bg-green-100 border-green-400" },
  { level: 5, emoji: "😄", label: "Great", bg: "bg-purple-50 border-purple-200", activeBg: "bg-purple-100 border-purple-400" },
];

const tagOptions = ["Work", "Relationships", "Health", "Sleep", "Exercise", "Family", "Money", "Weather", "Social", "Creative"];

export default function MoodPage() {
  const { token } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<MoodEntry[]>([]);

  useEffect(() => {
    if (token) {
      loadSummary();
      loadHistory();
    }
  }, [token]);

  const loadSummary = async () => {
    try {
      const s = await api<Summary>("/api/v1/moods/summary", { token: token! });
      setSummary(s);
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const h = await api<MoodEntry[]>("/api/v1/moods?days=30", { token: token! });
      setHistory(h);
    } catch {}
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const saveMood = async () => {
    if (!selectedMood || saving) return;
    setSaving(true);
    try {
      await api("/api/v1/moods", {
        method: "POST",
        body: { level: selectedMood, tags: selectedTags.length > 0 ? selectedTags : null, note: note || null },
        token: token!,
      });
      setSaved(true);
      setSelectedMood(null);
      setSelectedTags([]);
      setNote("");
      loadSummary();
      loadHistory();
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Mood tracker</h1>
      <p className="text-gray-500 text-sm mb-6">Track how you feel and discover patterns over time</p>

      {saved && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <p className="text-green-800 font-medium text-sm">Mood logged!</p>
            <p className="text-green-600 text-xs">Keep checking in to build your streak.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">How are you feeling?</h2>

        <div className="flex gap-3 mb-6">
          {moods.map((m) => (
            <button key={m.level} onClick={() => setSelectedMood(m.level)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                selectedMood === m.level ? m.activeBg + " scale-105" : m.bg + " hover:scale-102"
              }`}>
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-medium text-gray-600">{m.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">What&apos;s making you feel this way?</p>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-[#3B4B9E] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Add a note <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E] resize-none"
                rows={2} placeholder="What's on your mind..." />
            </div>

            <button onClick={saveMood} disabled={saving}
              className="w-full py-2.5 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Log mood"}
            </button>
          </>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Streak</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.streak_days} <span className="text-sm font-normal text-gray-400">days</span></p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Avg mood (7d)</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.average_level ?? "—"} <span className="text-sm font-normal text-gray-400">/ 5</span></p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Top tags</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {summary.top_tags.length > 0 ? summary.top_tags.map((t) => (
                <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{t}</span>
              )) : <span className="text-xs text-gray-400">No tags yet</span>}
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent entries</h2>
          <div className="space-y-3">
            {history.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                <span className="text-2xl">{moods.find((m) => m.level === entry.level)?.emoji || "😐"}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {moods.find((m) => m.level === entry.level)?.label}
                    </span>
                    {entry.tags?.map((t) => (
                      <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                  {entry.note && <p className="text-xs text-gray-400 mt-0.5">{entry.note}</p>}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
