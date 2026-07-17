"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

function EmotionalTrendChart() {
  const points = [30, 55, 40, 70, 50, 80, 60, 90, 65, 85];
  const w = 300, h = 140;
  const pad = 16;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - pad * 2));
  const ys = points.map((v) => h - pad - ((v - 20) / 80) * (h - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${path} L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grad)" />
      <path d={path} fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill="#6366F1" />
    </svg>
  );
}

export default function LoginPage() {
  const { requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const dbg = await requestOtp(email);
      setDebugCode(dbg);
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, code);
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#6366F1] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-lg">Aawiz</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {step === "email" ? "Welcome to Aawiz" : "Check your email"}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {step === "email"
              ? "Sign in with your Gmail or work email"
              : `We sent a 6-digit code to ${email}`}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {debugCode && step === "code" && (
            <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
              Dev mode — your code: <span className="font-mono font-bold text-sm">{debugCode}</span>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] focus:bg-white transition-colors"
                  placeholder="you@gmail.com or you@company.com"
                  required
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#6366F1] text-white rounded-xl text-sm font-medium hover:bg-[#4F46E5] disabled:opacity-50 transition-colors">
                {loading ? "Sending code..." : "Log in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-base tracking-[0.4em] text-center font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] focus:bg-white transition-colors"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-[#6366F1] text-white rounded-xl text-sm font-medium hover:bg-[#4F46E5] disabled:opacity-50 transition-colors">
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
              <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                Back to login
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-gray-400">
            © 2025 Aawiz &nbsp;·&nbsp; Privacy Policy &nbsp;·&nbsp; Terms of Use
          </p>
        </div>
      </div>

      {/* Right — decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-[#F5F5FF] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Emotional Trend</p>
            <span className="text-xs text-gray-400 bg-white px-2.5 py-1 rounded-full border border-gray-200">Weekly</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <EmotionalTrendChart />
            <div className="flex justify-between mt-2 px-1">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <span key={d} className="text-[10px] text-gray-400">{d}</span>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Track your emotional wellbeing<br />and discover patterns over time.
          </p>
        </div>

        {/* Background blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-[#6366F1]/8 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
