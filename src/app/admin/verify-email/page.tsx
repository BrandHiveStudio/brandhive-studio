"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!token) {
      setError("Missing verification token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Email verification failed.");
      }

      setSuccessEmail(data.email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-white">Missing Token</h2>
        <p className="text-xs text-white/60 leading-relaxed">
          The verification link does not include a valid confirmation token.
        </p>
        <Link
          href="/admin/login"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all mt-4"
        >
          <span>Return to Sign In</span>
        </Link>
      </div>
    );
  }

  if (successEmail) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-white">Email Address Verified</h2>
        <p className="text-xs text-white/60 leading-relaxed">
          Your administrative email has been successfully updated to:
        </p>
        <div className="p-3 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 text-[#16C7FF] font-mono text-xs font-semibold">
          {successEmail}
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          Please use this email address for all future administrative sign-ins.
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

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-white">Verification Failed</h2>
        <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
        <p className="text-xs text-white/40 leading-relaxed">
          Verification links expire in 2 hours and can only be used once. If your link expired, please initiate an email change again from System Settings.
        </p>
        <Link
          href="/admin/login"
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all mt-4"
        >
          <span>Return to Sign In</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-[#16C7FF]/10 border border-[#16C7FF]/20 text-[#16C7FF] mx-auto animate-pulse">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-white">Verifying Email Address</h2>
        <p className="text-xs text-white/50 leading-relaxed">
          Validating your single-use confirmation token with BrandHive Studio security...
        </p>
      </div>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
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
          <Suspense fallback={<div className="text-center py-8 text-white/50 text-xs">Loading verification service...</div>}>
            <VerifyEmailContent />
          </Suspense>
        </div>

        <p className="text-center text-[11px] text-white/30 mt-6">
          © {new Date().getFullYear()} BrandHive Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
}
