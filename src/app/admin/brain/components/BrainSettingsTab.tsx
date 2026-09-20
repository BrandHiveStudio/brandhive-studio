"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Settings2,
  Edit2,
  Trash2,
  X,
  Building2,
  Phone,
  Clock,
  CreditCard,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import type { BrainSetting } from "./types";

interface BrainSettingsTabProps {
  settings: BrainSetting[];
  onOpenCreate: () => void;
  onOpenEdit: (setting: BrainSetting) => void;
  onOpenDelete: (setting: BrainSetting) => void;
  onToggleActive: (setting: BrainSetting) => Promise<void> | void;
  togglingId: string | null;
}

interface SettingGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keys: string[];
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    id: "business",
    title: "Business Information",
    description: "Core agency identity, branding slogan, URL, and operational timezone",
    icon: Building2,
    keys: ["business_name", "slogan", "website_url", "timezone"],
  },
  {
    id: "contact",
    title: "Contact Details & Social Channels",
    description: "Official customer communication numbers, email, and social profiles",
    icon: Phone,
    keys: [
      "contact_email",
      "contact_phone_whatsapp",
      "facebook_url",
      "instagram_url",
      "tiktok_url",
    ],
  },
  {
    id: "operations",
    title: "Operations, Hours & Support",
    description: "Human business hours, client relations team, and AI vs human handoff rules",
    icon: Clock,
    keys: ["business_hours", "support_availability", "client_relations_team_name"],
  },
  {
    id: "payments",
    title: "Pricing & Payment Terms",
    description: "Default catalog currency, accepted payment methods, and standard payment terms",
    icon: CreditCard,
    keys: ["currency", "payment_methods", "payment_terms_standard"],
  },
];

export default function BrainSettingsTab({
  settings,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  togglingId,
}: BrainSettingsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredSettings = useMemo(() => {
    return settings.filter((s) => {
      if (statusFilter === "active" && !s.isActive) return false;
      if (statusFilter === "inactive" && s.isActive) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.key.toLowerCase().includes(q) ||
        s.value.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });
  }, [settings, search, statusFilter]);

  // Group settings
  const groupedData = useMemo(() => {
    const knownKeys = new Set(SETTING_GROUPS.flatMap((g) => g.keys));

    const result = SETTING_GROUPS.map((group) => {
      const items = filteredSettings.filter((s) => group.keys.includes(s.key));
      return { ...group, items };
    });

    const otherItems = filteredSettings.filter((s) => !knownKeys.has(s.key));
    if (otherItems.length > 0) {
      result.push({
        id: "other",
        title: "Additional Policies & Parameters",
        description: "Custom knowledge parameters and configuration values",
        icon: Sliders,
        keys: otherItems.map((o) => o.key),
        items: otherItems,
      });
    }

    return result;
  }, [filteredSettings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search settings by key, value, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090C12] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF]/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-3 py-2.5 rounded-xl bg-[#090C12] border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs hover:bg-[#16C7FF]/90 transition-all shadow-lg shadow-[#16C7FF]/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="size-3.5" />
            <span>New Setting</span>
          </button>
        </div>
      </div>

      {/* Grouped Settings Display */}
      {filteredSettings.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <Settings2 className="size-7" />
          </div>
          <h3 className="text-base font-bold text-white">No settings found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 mb-6">
            {search || statusFilter !== "all"
              ? "No business settings match the search criteria."
              : "No settings records currently found in Turso."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedData.map((group) => {
            if (group.items.length === 0) return null;
            const Icon = group.icon;

            return (
              <div
                key={group.id}
                className="rounded-3xl bg-[#090C12] border border-white/10 overflow-hidden shadow-xl"
              >
                {/* Group Header */}
                <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF] shrink-0">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{group.title}</h3>
                      <p className="text-[11px] text-white/50">{group.description}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-white/50">
                    {group.items.length} {group.items.length === 1 ? "setting" : "settings"}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-white/5">
                  {group.items.map((setting) => (
                    <div
                      key={setting.id || setting.key}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-white/[0.01] transition-colors group"
                    >
                      {/* Left Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#16C7FF] tracking-wide">
                            {setting.key}
                          </span>
                          {setting.description && (
                            <span className="text-[11px] text-white/40 hidden md:inline truncate">
                              • {setting.description}
                            </span>
                          )}
                        </div>

                        {setting.description && (
                          <p className="text-[11px] text-white/40 md:hidden">
                            {setting.description}
                          </p>
                        )}

                        {/* Value Preview Box */}
                        <div className="p-3 rounded-xl bg-[#0B0F19] border border-white/5 text-xs text-white/90 font-mono break-all whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                          {setting.value}
                        </div>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center justify-end gap-2 shrink-0 sm:pt-1">
                        <button
                          type="button"
                          onClick={() => onToggleActive(setting)}
                          disabled={togglingId === setting.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                            setting.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              setting.isActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"
                            }`}
                          />
                          <span>{setting.isActive ? "Active" : "Disabled"}</span>
                        </button>

                        <button
                          onClick={() => onOpenEdit(setting)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="size-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenDelete(setting)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-white/70 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
