import React from "react";
import Link from "next/link";
import { Settings, ArrowLeft, ShieldCheck, Database, Cloud } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
            <Settings className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">System Settings</h1>
            <p className="text-xs text-white/50">Admin security credentials, API integrations, and environment status.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Database className="size-4 text-[#16C7FF]" />
              <span>Turso Database Configuration</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Target Database: <code className="text-[#16C7FF]">website-cmsadmin-data</code>. Managed via controlled Drizzle ORM migrations. Direct dashboard editing is disabled by policy.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Cloud className="size-4 text-[#16C7FF]" />
              <span>Cloudflare R2 Storage</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Server-side S3 abstraction layer. All secret access keys and tokens are restricted to the server environment and never delivered to the client.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-400" />
            <div>
              <div className="text-sm font-medium text-white">Admin Authentication Guard</div>
              <div className="text-xs text-white/40">Protected by Edge Middleware and HTTP-only signed tokens.</div>
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
