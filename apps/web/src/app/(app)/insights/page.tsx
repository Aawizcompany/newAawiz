"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type WeeklyReport = {
  days: Record<string, number>;
  total_entries: number;
  average: number | null;
  streak: number;
};

type MoodEntry = { id: string; level: number; tags: string[] | null; note: string | null; created_at: string };
type Summary = { entries: MoodEntry[]; average_level: number | null; top_tags: string[]; streak_days: number };

const moods = [
  { level: 1, emoji: "😢", label: "Awful" },
  { level: 2, emoji: "😕", label: "Bad" },
  { level: 3, emoji: "😐", label: "Okay" },
  { level: 4, emoji: "😊", label: "Good" },
  { level: 5, emoji: "😄", label: "Great" },
];

const tagColors = [
  "bg-[#EEF2FF] text-[#6366F1]",
  "bg-red-50 text-red-600",
  "bg-amber-50 text-amber-600",
  "bg-green-50 text-green-600",
  "bg-purple-50 text-purple-600",
];

function MoodTrendChart({ days }: { days: Record<string, number> }) {
  const entries = Object.entries(days);
  if (entries.length < 2) return (
    <div className="h-28 flex items-center justify-center">
      <p className="text-sm text-gray-400">Not enough data yet</p>
    </div>
  );

  const values = entries.map(([, v]) => v);
  const min = Math.max(1, Math.min(...values) - 0.5);
  const max = Math.min(5, Math.max(...values) + 0.5);
  const w = 300, h = 100, padX = 8, padY = 10;

  const xs = entries.map((_, i) => padX + (i / (entries.length - 1)) * (w - padX * 2));
  const ys = values.map((v) => padY + ((max - v) / (max - min)) * (h - padY * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${path} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#moodGrad)" />
        <path d={path} fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="3" fill="#6366F1" />
        ))}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        {entries.map(([day]) => (
          <span key={day} className="text-[10px] text-gray-400">{day}</span>
        ))}
      </div>
    </div>
  );
}

function StreakDots({ streak }: { streak: number }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex gap-2 justify-center mt-2">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
            i < streak % 7 ? "bg-[#6366F1] text-white" : "bg-gray-100 text-gray-400"
          }`}>
            {d}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InsightsPage() {
  const { token, user } = useAuth();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (!token) return;
    api<WeeklyReport>("/api/v1/reports/personal/weekly", { token }).then(setReport).catch(() => {});
    api<Summary>("/api/v1/moods/summary", { token }).then(setSummary).catch(() => {});
  }, [token]);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="pt-2">
      <div className="flex items-center gap-2 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Report</h1>
          <p className="text-xs text-gray-400">Your weekly wellbeing summary</p>
        </div>
      </div>

      {/* This Week's Mood */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <p className="text-sm font-semibold text-gray-900 mb-3">This Week&apos;s Mood</p>
        <div className="grid grid-cols-7 gap-1 text-center mb-3">
          {dayLabels.map((d, i) => {
            const val = report?.days[d.slice(0, 3)];
            const mood = val ? moods.find((m) => m.level === Math.round(val)) : null;
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">{d.slice(0, 3)}</span>
                <span className="text-[11px] font-semibold text-gray-700">{val ? val.toFixed(1) : "—"}</span>
                <span className="text-lg">{mood?.emoji || ""}</span>
              </div>
            );
          })}
        </div>
        {report?.average && (
          <p className="text-xs text-gray-400 text-center">
            Average mood: <span className="text-[#6366F1] font-semibold">{report.average}/5</span>
          </p>
        )}
      </div>

      {/* Top Tags */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <p className="text-sm font-semibold text-gray-900 mb-3">Top Tags</p>
        {summary && summary.top_tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summary.top_tags.map((tag, i) => (
              <span key={tag} className={`px-3 py-1.5 rounded-full text-xs font-medium ${tagColors[i % tagColors.length]}`}>
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Not enough check-ins yet. Keep checking in to unlock this view.</p>
        )}
      </div>

      {/* Mood Trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <p className="text-sm font-semibold text-gray-900 mb-3">Mood Trend</p>
        {report && Object.keys(report.days).length > 0 ? (
          <MoodTrendChart days={report.days} />
        ) : (
          <p className="text-xs text-gray-400 py-4 text-center">Not enough check-ins yet. Keep checking in to unlock this view.</p>
        )}
      </div>

      {/* Streak */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🔥</span>
          <p className="text-sm font-semibold text-gray-900">Streak</p>
        </div>
        {summary ? (
          <>
            <p className="text-3xl font-bold text-[#6366F1] text-center my-2">
              {summary.streak_days} <span className="text-sm font-normal text-gray-400">days</span>
            </p>
            <StreakDots streak={summary.streak_days} />
            <p className="text-xs text-gray-400 text-center mt-3">
              {summary.streak_days > 0
                ? `Great job! Keep it up.`
                : "You haven't been checking in consistently."}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400 py-2 text-center">Not enough check-ins yet.</p>
        )}
      </div>

      {/* Weekly Reflection */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
        <p className="text-sm font-semibold text-gray-900 mb-3">Weekly Reflection</p>
        {report && report.total_entries > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">This week you checked in {report.total_entries} times.</p>
            {report.average && report.average >= 4 && (
              <p className="text-sm text-gray-600">You&apos;ve been feeling mostly positive this week. That&apos;s great!</p>
            )}
            {report.average && report.average < 3 && (
              <p className="text-sm text-gray-600">It seems like a tough week. Remember to take care of yourself.</p>
            )}
            {summary && summary.top_tags.length > 0 && (
              <p className="text-sm text-gray-600">
                <span className="text-[#6366F1] font-medium">{summary.top_tags[0]}</span> came up often this week.
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Not enough check-ins yet. Keep checking in to unlock this view.</p>
        )}
      </div>
    </div>
  );
}
