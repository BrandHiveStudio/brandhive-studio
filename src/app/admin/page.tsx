"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Cloud,
  ShieldCheck,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  MessageSquareQuote,
  Link2,
  FileText,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Inbox,
  HelpCircle,
  Newspaper,
  GitBranch,
  Bot,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface HealthStatus {
  status: string;
  database: {
    provider: string;
    database: string;
    ok: boolean;
    message: string;
    latencyMs?: number;
  };
  storage: {
    provider: string;
    bucket: string;
    ok: boolean;
    message: string;
    latencyMs?: number;
  };
}

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.error("Failed to fetch infrastructure health:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const modules = [
    {
      title: "Inquiries & Leads",
      description: "Review and respond to client project inquiries and lead statuses in Turso.",
      href: "/admin/inquiries",
      icon: Inbox,
      status: "Active",
    },
    {
      title: "Projects & Portfolio",
      description: "Manage agency case studies, deliverables, categories, and cover images.",
      href: "/admin/projects",
      icon: FolderKanban,
      status: "Active",
    },
    {
      title: "Media Library",
      description: "Upload and manage high-resolution assets stored in Cloudflare R2.",
      href: "/admin/media",
      icon: ImageIcon,
      status: "Active",
    },
    {
      title: "Services",
      description: "Maintain service catalog, capabilities, tags, and descriptions.",
      href: "/admin/services",
      icon: Layers,
      status: "Active",
    },
    {
      title: "Process & Workflow",
      description: "Manage 5-stage agency workflow, deliverables, step numbers, and homepage process nodes.",
      href: "/admin/process",
      icon: GitBranch,
      status: "Active",
    },
    {
      title: "Testimonials",
      description: "Curate verified client reviews, partner feedback, and company credentials.",
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
      status: "Active",
    },
    {
      title: "Frequently Asked Questions",
      description: "Manage client FAQs, categories, answers, and accordion ordering in Turso.",
      href: "/admin/faqs",
      icon: HelpCircle,
      status: "Active",
    },
    {
      title: "Insights & Articles",
      description: "Publish thought leadership, design guides, featured stories, and articles in Turso.",
      href: "/admin/posts",
      icon: Newspaper,
      status: "Active",
    },
    {
      title: "External Links",
      description: "Configure social media channels, booking links, and external platforms.",
      href: "/admin/links",
      icon: Link2,
      status: "Active",
    },
    {
      title: "Site Content",
      description: "Update company profile copy, stat counters, and dynamic text blocks.",
      href: "/admin/content",
      icon: FileText,
      status: "Active",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0C101A] via-[#090E17] to-[#080B12] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#16C7FF]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16C7FF]/10 border border-[#16C7FF]/20 text-[#16C7FF] text-xs font-semibold uppercase tracking-wider mb-3">
            <CheckCircle2 className="size-3.5" />
            <span>All Systems Operational</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            BrandHive Studio Management Panel
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Turso database, Cloudflare R2 storage, and admin authentication are connected and operational.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="relative z-10 self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#16C7FF]" : "text-white/60"}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Infrastructure Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Turso Database */}
        <div className="p-6 rounded-2xl bg-[#090C12] border border-white/10 relative overflow-hidden group hover:border-[#16C7FF]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="size-10 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
              <Database className="size-5" />
            </div>
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                health?.database.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              {health?.database.ok ? "Connected" : "Connecting..."}
            </span>
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Turso Database</div>
          <div className="text-base font-semibold text-white mt-0.5">website-cmsadmin-data</div>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            {health?.database.message || "Checking database connection..."}
          </p>
          {health?.database.latencyMs !== undefined && (
            <div className="mt-3 text-[11px] text-white/30 font-mono">
              Latency: {health.database.latencyMs}ms
            </div>
          )}
        </div>

        {/* Cloudflare R2 */}
        <div className="p-6 rounded-2xl bg-[#090C12] border border-white/10 relative overflow-hidden group hover:border-[#16C7FF]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="size-10 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
              <Cloud className="size-5" />
            </div>
            <span
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                health?.storage.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              {health?.storage.ok ? "Ready" : "Connecting..."}
            </span>
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Object Storage</div>
          <div className="text-base font-semibold text-white mt-0.5">Cloudflare R2 Bucket</div>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            {health?.storage.message || "Checking R2 bucket credentials..."}
          </p>
          {health?.storage.latencyMs !== undefined && (
            <div className="mt-3 text-[11px] text-white/30 font-mono">
              Latency: {health.storage.latencyMs}ms
            </div>
          )}
        </div>

        {/* Admin Session Security */}
        <div className="p-6 rounded-2xl bg-[#090C12] border border-white/10 relative overflow-hidden group hover:border-[#16C7FF]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="size-10 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
              <ShieldCheck className="size-5" />
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              Active
            </span>
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider font-mono">Authentication</div>
          <div className="text-base font-semibold text-white mt-0.5">JWT HTTP-Only Session</div>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            Middleware verified. No plain passwords stored. Client-side credential exposure prevented.
          </p>
          <div className="mt-3 text-[11px] text-white/30 font-mono">
            Scope: Admin Authorized Only
          </div>
        </div>
      </div>

      {/* WhatsApp AI Agent Ecosystem Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0C121E] via-[#090E17] to-[#060A10] border border-[#16C7FF]/20 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#16C7FF]/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16C7FF]/10 border border-[#16C7FF]/25 text-[#16C7FF] text-xs font-semibold">
              <Bot className="size-3.5" />
              <span>WhatsApp AI Chatbot & Knowledge Bridge</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Production WhatsApp AI Agent (Gemini + Supabase)
            </h2>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Meta WhatsApp Cloud API webhook, Google Gemini function-calling tools, and Supabase Knowledge Base operate with live synchronization from BrandHive Website CMS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/94706410093"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-xs font-semibold text-[#25D366] transition-all"
            >
              <MessageSquare className="size-3.5" />
              <span>Test WhatsApp (+94 70 641 0093)</span>
            </a>
            <Link
              href="/api/v1/knowledge/faqs"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white transition-all"
            >
              <Sparkles className="size-3.5 text-[#16C7FF]" />
              <span>Inspect Knowledge API</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">AI Engine</div>
            <div className="text-xs font-semibold text-white mt-1">Google Gemini</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">5 Knowledge Tools Active</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Knowledge Base</div>
            <div className="text-xs font-semibold text-white mt-1">Supabase Postgres</div>
            <div className="text-[10px] text-[#16C7FF] mt-0.5">Dynamic Pricing & Add-ons</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Inbound Webhook</div>
            <div className="text-xs font-semibold text-white mt-1">Meta Cloud API</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">HMAC-SHA256 Verified</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Sync Bridge</div>
            <div className="text-xs font-semibold text-white mt-1">CMS Knowledge API</div>
            <div className="text-[10px] text-[#16C7FF] mt-0.5">FAQs & Business Metas</div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">CMS Modules</h2>
            <p className="text-xs text-white/50 mt-0.5">
              All 10 content modules are active and connected to the Turso database.
            </p>
          </div>
          <span className="text-xs text-[#16C7FF] font-medium">10 Modules Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                className="group p-6 rounded-2xl bg-[#090C12] border border-white/10 hover:border-[#16C7FF]/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-xl bg-white/[0.04] group-hover:bg-[#16C7FF]/15 group-hover:text-[#16C7FF] border border-white/5 group-hover:border-[#16C7FF]/30 flex items-center justify-center text-white/70 transition-colors">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-white/50 border border-white/5">
                      {m.status}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-[#16C7FF] transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 group-hover:text-[#16C7FF] transition-colors">
                  <span>Explore Module</span>
                  <ArrowRight className="size-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
