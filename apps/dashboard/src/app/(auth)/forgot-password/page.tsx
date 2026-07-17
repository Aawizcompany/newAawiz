"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#3B4B9E] flex items-center justify-center">
          <span className="text-white font-bold text-sm">Aa</span>
        </div>
      </div>

      {!sent ? (
        <>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Forgot password</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your email and we&apos;ll send you a password reset link.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4B9E]"
              placeholder="Enter your email" />
          </div>
          <button onClick={() => setSent(true)}
            className="w-full py-2.5 bg-[#3B4B9E] text-white rounded-lg text-sm font-medium hover:bg-[#2d3a7a] transition-colors">
            Send reset link
          </button>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-6">
            We sent a password reset link to <strong>{email}</strong>. Click the link to reset your password.
          </p>
          <button onClick={() => setSent(false)}
            className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Resend link
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-[#3B4B9E] hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
