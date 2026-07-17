"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

const steps = ["Company info", "Password", "Summary"];

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    org_name: "",
    industry: "",
    country: "",
    email: "",
    password: "",
    confirm: "",
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        org_name: form.org_name,
        industry: form.industry || undefined,
        country: form.country || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#3B4B9E] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Aa</span>
        </div>
        <span className="text-xl font-semibold text-gray-900">Aawiz</span>
      </div>

      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              i <= step ? "bg-[#3B4B9E] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm ${i <= step ? "text-gray-900" : "text-gray-400"}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Company info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company name *</label>
            <input value={form.org_name} onChange={(e) => set("org_name", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="Enter your company name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input value={form.industry} onChange={(e) => set("industry", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="e.g. Technology" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input value={form.country} onChange={(e) => set("country", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="e.g. Netherlands" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin email *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="admin@company.com" required />
          </div>
          <button onClick={() => form.org_name && form.email ? setStep(1) : setError("Fill required fields")}
            className="w-full py-2.5 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
            Next
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Password setup</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="Min 8 characters" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password *</label>
            <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="Repeat password" required />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button onClick={() => form.password.length >= 8 ? setStep(2) : setError("Password must be at least 8 characters")}
              className="flex-1 py-2.5 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Onboarding summary</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">{form.org_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Industry</span><span>{form.industry || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Country</span><span>{form.country || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Admin email</span><span>{form.email}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] disabled:opacity-50 transition-colors">
              {loading ? "Creating..." : "Create organization"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-[#3B4B9E] hover:underline font-medium">Login</Link>
      </p>
    </div>
  );
}
