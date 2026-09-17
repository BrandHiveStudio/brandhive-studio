"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch password reset request.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#16C7FF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-tr from-[#16C7FF] to-[#0D85FF] font-bold text-black text-xl shadow-[0_0_30px_rgba(22,199,255,0.4)] mb-4">
            BH
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">BrandHive Studio</h1>
          <p className="text-xs tracking-widest uppercase text-[#16C7FF] font-semibold mt-1">
            Admin Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0A0D14]/90 border border-white/10 rounded-2xl md:rounded-3xl p-7 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">Reset Link Dispatched</h2>
              <p className="text-xs text-white/60 leading-relaxed">
                If an administrative account matches <strong className="text-white">{email}</strong>, a secure, single-use password reset link has been dispatched.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/40 leading-relaxed">
                The link is valid for 1 hour. Please check your inbox and spam folder.
              </div>
              <Link
                href="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all mt-4"
              >
                <ArrowLeft className="size-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Password Recovery</h2>
                <p className="text-xs text-white/50 mt-1">
                  Enter your administrative email to receive a secure password reset link.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="size-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Admin Email</label>
                  <div className="relative">
                    <Mail className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@brandhivestudio.com.lk"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF] focus:ring-1 focus:ring-[#16C7FF] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(22,199,255,0.3)]"
                >
                  <span>{loading ? "Verifying..." : "Send Reset Link"}</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Sign In</span>
                </Link>
                <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                  <ShieldCheck className="size-3.5 text-emerald-400/80" />
                  <span>Encrypted Service</span>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-white/30 mt-6">
          © {new Date().getFullYear()} BrandHive Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
}
