"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type Prompt = {
  id: string; name: string; use_case: string; persona: string | null;
  version: number; system_prompt: string; is_active: boolean; created_at: string;
};

type ModelConfig = {
  id: string; use_case: string; model_id: string;
  temperature: number; max_tokens: number; is_active: boolean;
};

export default function AIConfigPage() {
  const { token } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [tab, setTab] = useState<"prompts" | "models">("prompts");
  const [showForm, setShowForm] = useState(false);
  const [showModelForm, setShowModelForm] = useState(false);
  const [form, setForm] = useState({ name: "", use_case: "chat", persona: "", system_prompt: "" });
  const [modelForm, setModelForm] = useState({ use_case: "chat", model_id: "anthropic/claude-sonnet-4-20250514", temperature: "0.7", max_tokens: "1024" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (token) { loadPrompts(); loadModels(); } }, [token]);

  const loadPrompts = async () => {
    try { setPrompts(await api<Prompt[]>("/api/v1/admin/ai/prompts", { token: token! })); } catch {}
  };
  const loadModels = async () => {
    try { setModels(await api<ModelConfig[]>("/api/v1/admin/ai/models", { token: token! })); } catch {}
  };

  const savePrompt = async () => {
    setSaving(true);
    try {
      await api("/api/v1/admin/ai/prompts", {
        method: "POST", token: token!,
        body: { ...form, persona: form.persona || null },
      });
      setShowForm(false);
      setForm({ name: "", use_case: "chat", persona: "", system_prompt: "" });
      loadPrompts();
    } catch {}
    setSaving(false);
  };

  const saveModel = async () => {
    setSaving(true);
    try {
      await api("/api/v1/admin/ai/models", {
        method: "PUT", token: token!,
        body: { ...modelForm, temperature: parseFloat(modelForm.temperature), max_tokens: parseInt(modelForm.max_tokens) },
      });
      setShowModelForm(false);
      loadModels();
    } catch {}
    setSaving(false);
  };

  const rollback = async (id: string) => {
    try {
      await api(`/api/v1/admin/ai/prompts/${id}/rollback`, { method: "POST", token: token! });
      loadPrompts();
    } catch {}
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">AI configuration</h1>
      <p className="text-gray-400 text-sm mb-6">Manage prompts, models, and AI behavior</p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("prompts")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "prompts" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
          Prompts
        </button>
        <button onClick={() => setTab("models")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "models" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
          Models
        </button>
      </div>

      {tab === "prompts" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Prompt templates</h2>
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              {showForm ? "Cancel" : "+ New prompt"}
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" placeholder="e.g. Empathetic chat v2" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Use case</label>
                  <select value={form.use_case} onChange={(e) => setForm({ ...form, use_case: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
                    <option value="chat">Chat</option>
                    <option value="sentiment">Sentiment</option>
                    <option value="insight">Insight</option>
                    <option value="onboarding">Onboarding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Persona</label>
                  <select value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
                    <option value="">All personas</option>
                    <option value="empathetic">Empathetic</option>
                    <option value="analytical">Analytical</option>
                    <option value="energetic">Energetic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">System prompt</label>
                <textarea value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white resize-none"
                  rows={5} placeholder="You are Aawiz, a warm companion..." />
              </div>
              <button onClick={savePrompt} disabled={saving || !form.name || !form.system_prompt}
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save prompt"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {prompts.length === 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                <p className="text-gray-500">No prompts configured. The system uses default prompts.</p>
              </div>
            )}
            {prompts.map((p) => (
              <div key={p.id} className={`bg-gray-800 rounded-xl border p-4 ${p.is_active ? "border-green-600" : "border-gray-700"}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">v{p.version}</span>
                      <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{p.use_case}</span>
                      {p.persona && <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{p.persona}</span>}
                      {p.is_active && <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded">Active</span>}
                    </div>
                  </div>
                  {!p.is_active && (
                    <button onClick={() => rollback(p.id)} className="text-xs text-red-400 hover:text-red-300">Rollback to this</button>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{p.system_prompt}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "models" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Model configuration</h2>
            <button onClick={() => setShowModelForm(!showModelForm)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              {showModelForm ? "Cancel" : "+ Add model config"}
            </button>
          </div>

          {showModelForm && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Use case</label>
                  <select value={modelForm.use_case} onChange={(e) => setModelForm({ ...modelForm, use_case: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
                    <option value="chat">Chat</option>
                    <option value="sentiment">Sentiment</option>
                    <option value="insight">Insight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Model ID (OpenRouter)</label>
                  <input value={modelForm.model_id} onChange={(e) => setModelForm({ ...modelForm, model_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Temperature</label>
                  <input value={modelForm.temperature} onChange={(e) => setModelForm({ ...modelForm, temperature: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" type="number" step="0.1" min="0" max="2" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max tokens</label>
                  <input value={modelForm.max_tokens} onChange={(e) => setModelForm({ ...modelForm, max_tokens: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" type="number" />
                </div>
              </div>
              <button onClick={saveModel} disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save model config"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {models.length === 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                <p className="text-gray-500">No custom model configs. Using defaults (Claude Sonnet via OpenRouter).</p>
              </div>
            )}
            {models.map((m) => (
              <div key={m.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{m.use_case}</span>
                  {m.is_active && <span className="text-[10px] bg-green-900 text-green-300 px-2 py-0.5 rounded">Active</span>}
                </div>
                <p className="text-xs text-gray-400">Model: {m.model_id} | Temp: {m.temperature} | Max tokens: {m.max_tokens}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
