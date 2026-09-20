"use client";

import React from "react";
import {
  Brain,
  Layers,
  Package,
  PlusCircle,
  HelpCircle,
  Settings2,
  CheckCircle2,
  Database,
  ArrowRight,
  Info,
  Sliders,
  DollarSign,
} from "lucide-react";
import type { BrainService, BrainAddon, BrainFaq, BrainSetting } from "./types";

interface BrainOverviewProps {
  services: BrainService[];
  addons: BrainAddon[];
  faqs: BrainFaq[];
  settings: BrainSetting[];
  onNavigateTab: (tab: "services" | "addons" | "faqs" | "settings") => void;
  onOpenCreateService: (type?: "service" | "package") => void;
  onOpenCreateFaq: () => void;
}

export default function BrainOverview({
  services,
  addons,
  faqs,
  settings,
  onNavigateTab,
  onOpenCreateService,
  onOpenCreateFaq,
}: BrainOverviewProps) {
  const packagesList = services.filter((s) => s.itemType === "package");
  const servicesOnlyList = services.filter((s) => s.itemType === "service");

  const totalActiveServices = services.filter((s) => s.isActive).length;
  const totalInactiveServices = services.length - totalActiveServices;

  const totalActiveAddons = addons.filter((a) => a.isActive).length;
  const totalActiveFaqs = faqs.filter((f) => f.isActive).length;
  const totalActiveSettings = settings.filter((s) => s.isActive).length;

  const totalRecords = services.length + addons.length + faqs.length + settings.length;

  // Group services by category
  const categoriesCount = services.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero / Knowledge Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090C12] via-[#0B101B] to-[#0A1628] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-[#16C7FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16C7FF]/10 border border-[#16C7FF]/20 text-[11px] font-medium text-[#16C7FF]">
              <Database className="size-3.5" />
              <span>Turso Authoritative Knowledge Base</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              HIVE AI Brain Knowledge Center
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Manage the dedicated pricing, service packages, add-ons, FAQs, and business policies that
              power Website HIVE AI responses. All records are stored securely in Turso and synchronized with
              the website sales concierge engine.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 min-w-[120px] text-center">
              <div className="text-2xl font-black text-[#16C7FF]">{totalRecords}</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Total Knowledge Records</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 min-w-[120px] text-center">
              <div className="text-2xl font-black text-emerald-400">
                {totalActiveServices + totalActiveAddons + totalActiveFaqs + totalActiveSettings}
              </div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Active Records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Packages Card */}
        <div
          onClick={() => onNavigateTab("services")}
          className="group cursor-pointer p-5 rounded-2xl bg-[#090C12] border border-white/10 hover:border-[#16C7FF]/40 transition-all hover:bg-white/[0.02] shadow-lg relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Package className="size-5" />
            </div>
            <ArrowRight className="size-4 text-white/30 group-hover:text-[#16C7FF] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{packagesList.length}</div>
          <div className="text-xs font-semibold text-white/80 mt-0.5">Packages & Bundles</div>
          <p className="text-[11px] text-white/40 mt-1">
            {packagesList.filter((p) => p.isActive).length} active tiers with structured deliverables
          </p>
        </div>

        {/* Services Card */}
        <div
          onClick={() => onNavigateTab("services")}
          className="group cursor-pointer p-5 rounded-2xl bg-[#090C12] border border-white/10 hover:border-[#16C7FF]/40 transition-all hover:bg-white/[0.02] shadow-lg relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF] group-hover:scale-105 transition-transform">
              <Layers className="size-5" />
            </div>
            <ArrowRight className="size-4 text-white/30 group-hover:text-[#16C7FF] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{servicesOnlyList.length}</div>
          <div className="text-xs font-semibold text-white/80 mt-0.5">Individual Services</div>
          <p className="text-[11px] text-white/40 mt-1">
            {servicesOnlyList.filter((s) => s.isActive).length} active catalog services across categories
          </p>
        </div>

        {/* Add-ons Card */}
        <div
          onClick={() => onNavigateTab("addons")}
          className="group cursor-pointer p-5 rounded-2xl bg-[#090C12] border border-white/10 hover:border-[#16C7FF]/40 transition-all hover:bg-white/[0.02] shadow-lg relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Sliders className="size-5" />
            </div>
            <ArrowRight className="size-4 text-white/30 group-hover:text-[#16C7FF] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{addons.length}</div>
          <div className="text-xs font-semibold text-white/80 mt-0.5">Service Add-ons</div>
          <p className="text-[11px] text-white/40 mt-1">
            {totalActiveAddons} active optional upgrades & add-on pricing
          </p>
        </div>

        {/* FAQs Card */}
        <div
          onClick={() => onNavigateTab("faqs")}
          className="group cursor-pointer p-5 rounded-2xl bg-[#090C12] border border-white/10 hover:border-[#16C7FF]/40 transition-all hover:bg-white/[0.02] shadow-lg relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <HelpCircle className="size-5" />
            </div>
            <ArrowRight className="size-4 text-white/30 group-hover:text-[#16C7FF] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{faqs.length}</div>
          <div className="text-xs font-semibold text-white/80 mt-0.5">Knowledge FAQs</div>
          <p className="text-[11px] text-white/40 mt-1">
            {totalActiveFaqs} active answers for client inquiries & objection handling
          </p>
        </div>
      </div>

      {/* Two Column Layout: Category Breakdown + Business Settings Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#090C12] border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Services by Category</h3>
              <p className="text-xs text-white/50 mt-0.5">Catalog distribution across agency disciplines</p>
            </div>
            <button
              onClick={() => onNavigateTab("services")}
              className="text-xs text-[#16C7FF] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>Manage Catalog</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(categoriesCount).map(([cat, count]) => {
              const formattedName = cat
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white/90">{formattedName}</span>
                    <div className="text-[10px] text-white/40 font-mono">Category: {cat}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs font-bold text-[#16C7FF]">
                    {count} items
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenCreateService("package")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16C7FF]/10 hover:bg-[#16C7FF]/20 text-[#16C7FF] border border-[#16C7FF]/30 text-xs font-medium transition-all"
            >
              <PlusCircle className="size-3.5" />
              <span>New Package</span>
            </button>
            <button
              onClick={() => onOpenCreateService("service")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-medium transition-all"
            >
              <PlusCircle className="size-3.5" />
              <span>New Service</span>
            </button>
            <button
              onClick={onOpenCreateFaq}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-medium transition-all"
            >
              <PlusCircle className="size-3.5" />
              <span>New FAQ</span>
            </button>
          </div>
        </div>

        {/* Business Settings Snapshot (1 Col) */}
        <div className="rounded-3xl bg-[#090C12] border border-white/10 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4.5 text-[#16C7FF]" />
                <h3 className="text-base font-bold text-white tracking-tight">Business Policies</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                {totalActiveSettings} Active
              </span>
            </div>
            <p className="text-xs text-white/50">
              Agency operating rules, payment conditions, working hours, and contact channels stored in Turso.
            </p>

            <div className="space-y-2.5">
              {settings.slice(0, 5).map((setting) => (
                <div
                  key={setting.id || setting.key}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#16C7FF] truncate max-w-[180px]">
                      {setting.key}
                    </span>
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-white/40 truncate">
                    {setting.description || setting.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("settings")}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <span>View All {settings.length} Settings & Policies</span>
            <ArrowRight className="size-3.5 text-white/50" />
          </button>
        </div>
      </div>

      {/* Info Notice about Architecture */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs text-white/50">
        <Info className="size-4 text-[#16C7FF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-white/80 font-medium">Turso Database Foundation & Live Reader Notice</span>
          <p>
            Edits made in this workspace are saved directly to the dedicated HIVE Brain tables in Turso.
            As designated in the project architecture roadmap, the live customer chat reader continues using
            its verified source during Phase 3 and will transition to this Turso Brain in Phase 4 after Admin UI verification.
          </p>
        </div>
      </div>
    </div>
  );
}
