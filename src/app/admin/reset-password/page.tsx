"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Check, X } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Policy validation checks for real-time visual feedback
  const requirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
    { label: "One number (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "One special character (!@#$...)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]/.test(newPassword) },
  ];

  const allMet = requirements.every((r) => r.met);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing or invalid password reset token. Please request a new link.");
      return;
    }

    if (!allMet) {
      setError("Please ensure your new password satisfies all security requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-white">Missing Reset Token</h2>
        <p className="text-xs text-white/60 leading-relaxed">
          The reset link you followed is missing its security token or is malformed.
        </p>
        <Link
          href="/admin/forgot-password"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-sm hover:opacity-95 transition-all mt-4"
        >
          <span>Request New Reset Link</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-white">Password Updated Successfully</h2>
        <p className="text-xs text-white/60 leading-relaxed">
          Your administrative password has been updated. All previous sessions have been securely invalidated across all devices.
        </p>
        <Link
          href="/admin/login"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-sm hover:opacity-95 transition-all mt-4"
        >
          <span>Sign In to Admin Portal</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Set New Password</h2>
        <p className="text-xs text-white/50 mt-1">
          Create a strong, new password for your administrative account.
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
          <label className="block text-xs font-medium text-white/70 mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF] focus:ring-1 focus:ring-[#16C7FF] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/70 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF] focus:ring-1 focus:ring-[#16C7FF] transition-colors"
            />
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px]">
          <div className="text-white/40 font-medium mb-1">Password Requirements:</div>
          {requirements.map((req, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 transition-colors ${
                req.met ? "text-emerald-400" : "text-white/40"
              }`}
            >
              {req.met ? <Check className="size-3" /> : <X className="size-3 opacity-40" />}
              <span>{req.label}</span>
            </div>
          ))}
          {newPassword.length > 0 && confirmPassword.length > 0 && (
            <div
              className={`flex items-center gap-2 pt-1 border-t border-white/5 transition-colors ${
                passwordsMatch ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {passwordsMatch ? <Check className="size-3" /> : <X className="size-3" />}
              <span>Passwords match</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !allMet || !passwordsMatch}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(22,199,255,0.3)]"
        >
          <span>{loading ? "Resetting Password..." : "Update Password"}</span>
          <ArrowRight className="size-4" />
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-white/40 text-center">
        <ShieldCheck className="size-3.5 text-emerald-400/80" />
        <span>Cryptographically Verified Reset</span>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-center py-8 text-white/50 text-xs">Loading reset service...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-[11px] text-white/30 mt-6">
          © {new Date().getFullYear()} BrandHive Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
}
