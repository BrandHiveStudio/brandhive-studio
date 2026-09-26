"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  ArrowLeft,
  ShieldCheck,
  Database,
  Cloud,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Check,
  X,
  Loader2,
} from "lucide-react";
import PasswordInput from "@/components/ui/PasswordInput";

export default function AdminSettingsPage() {
  const router = useRouter();

  // Admin user data
  const [currentEmail, setCurrentEmail] = useState("");
  const [adminName, setAdminName] = useState("");

  // Change Email state
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Change Password state
  const [pwdCurrentPassword, setPwdCurrentPassword] = useState("");
  const [pwdNewPassword, setPwdNewPassword] = useState("");
  const [pwdConfirmPassword, setPwdConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current admin info
    fetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentEmail(data.user.email || "");
          setAdminName(data.user.name || "");
        }
      })
      .catch(console.error);
  }, []);

  // Password policy checklist
  const requirements = [
    { label: "At least 8 characters", met: pwdNewPassword.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(pwdNewPassword) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(pwdNewPassword) },
    { label: "One number (0-9)", met: /[0-9]/.test(pwdNewPassword) },
    { label: "One special character (!@#$...)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]/.test(pwdNewPassword) },
  ];

  const allPasswordReqsMet = requirements.every((r) => r.met);
  const passwordsMatch = pwdNewPassword.length > 0 && pwdNewPassword === pwdConfirmPassword;

  // Handle Email Change
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    setEmailLoading(true);

    try {
      const res = await fetch("/api/admin/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: emailCurrentPassword,
          newEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate email change.");
      }

      setEmailSuccess(data.message);
      setEmailCurrentPassword("");
      setNewEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred.";
      setEmailError(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!allPasswordReqsMet) {
      setPwdError("Please ensure your new password satisfies all security requirements.");
      return;
    }

    if (!passwordsMatch) {
      setPwdError("New passwords do not match.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdCurrentPassword,
          newPassword: pwdNewPassword,
          confirmPassword: pwdConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setPwdSuccess("Password updated successfully! Redirecting to sign in with your new credentials...");
      setPwdCurrentPassword("");
      setPwdNewPassword("");
      setPwdConfirmPassword("");

      // Redirect after 2 seconds to require login
      setTimeout(() => {
        router.push("/admin/login");
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred.";
      setPwdError(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
            <Settings className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">System Settings & Account Security</h1>
            <p className="text-xs text-white/50">
              {adminName ? `Signed in as ${adminName}. ` : ""}Manage administrative credentials, email verification, and production environment status.
            </p>
          </div>
        </div>

        {/* Account Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Change Email */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-white mb-2">
                <Mail className="size-4 text-[#16C7FF]" />
                <span>Change Administrative Email</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Current email: <strong className="text-white font-mono">{currentEmail || "admin@brandhivestudio.com.lk"}</strong>.
                A confirmation link will be sent to verify ownership before activating the new address.
              </p>

              {emailSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{emailSuccess}</span>
                </div>
              )}

              {emailError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{emailError}</span>
                </div>
              )}

              <form onSubmit={handleChangeEmail} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">New Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new-admin@brandhivestudio.com.lk"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Current Password (to confirm)</label>
                  <PasswordInput
                    required
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    iconSize="sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={emailLoading || !newEmail || !emailCurrentPassword}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#16C7FF]/10 hover:bg-[#16C7FF]/20 border border-[#16C7FF]/30 text-[#16C7FF] font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {emailLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Dispatching Verification Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Link</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Change Password */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-white mb-2">
                <KeyRound className="size-4 text-[#16C7FF]" />
                <span>Change Administrative Password</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Updating your password will immediately invalidate all active administrative sessions across all browsers.
              </p>

              {pwdSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              {pwdError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{pwdError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Current Password</label>
                  <PasswordInput
                    required
                    value={pwdCurrentPassword}
                    onChange={(e) => setPwdCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    iconSize="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">New Password</label>
                  <PasswordInput
                    required
                    value={pwdNewPassword}
                    onChange={(e) => setPwdNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    iconSize="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Confirm New Password</label>
                  <PasswordInput
                    required
                    value={pwdConfirmPassword}
                    onChange={(e) => setPwdConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    iconSize="sm"
                  />
                </div>

                {/* Requirements Checklist */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1 text-[11px]">
                  {requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 transition-colors ${
                        req.met ? "text-emerald-400" : "text-white/40"
                      }`}
                    >
                      {req.met ? <Check className="size-3" /> : <X className="size-3 opacity-40" />}
                      <span>{req.label}</span>
                    </div>
                  ))}
                  {pwdNewPassword.length > 0 && pwdConfirmPassword.length > 0 && (
                    <div
                      className={`flex items-center gap-1.5 pt-1 border-t border-white/5 transition-colors ${
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
                  disabled={pwdLoading || !allPasswordReqsMet || !passwordsMatch || !pwdCurrentPassword}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-xs hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(22,199,255,0.2)]"
                >
                  {pwdLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password & Re-authenticate</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Infrastructure Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Database className="size-4 text-[#16C7FF]" />
              <span>Turso Database Configuration</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Target Database: <code className="text-[#16C7FF]">website-cmsadmin-data</code>. Encrypted libSQL storage for administrative users, sessions, and CMS resources.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Cloud className="size-4 text-[#16C7FF]" />
              <span>Cloudflare R2 Storage</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Server-side S3 abstraction layer. All secret access keys and credentials are strictly isolated from client bundles.
            </p>
          </div>
        </div>

        {/* Auth Guard Status */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-400" />
            <div>
              <div className="text-sm font-medium text-white">Admin Authentication Guard</div>
              <div className="text-xs text-white/40">
                Protected by Edge Middleware, HTTP-only signed JWTs, and database-backed session revocation.
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
