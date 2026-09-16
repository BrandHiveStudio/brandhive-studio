"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Globe,
  ExternalLink,
} from "lucide-react";
import type { ExternalLink as ExternalLinkType } from "@/lib/db/schema";

interface LinkFormProps {
  initialData?: Partial<ExternalLinkType>;
  isEdit?: boolean;
  linkId?: string;
}

export const PLATFORM_OPTIONS = [
  { id: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/94706410093", prefixExample: "https://wa.me/..." },
  { id: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/brandhivestudiolk", prefixExample: "https://instagram.com/..." },
  { id: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/brandhivestudiolk", prefixExample: "https://facebook.com/..." },
  { id: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@brandhivestudiolk", prefixExample: "https://tiktok.com/@..." },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/brandhivestudio", prefixExample: "https://linkedin.com/in/..." },
  { id: "behance", label: "Behance", placeholder: "https://www.behance.net/brandhivestudio", prefixExample: "https://behance.net/..." },
  { id: "phone", label: "Phone", placeholder: "tel:+94706410093", prefixExample: "tel:+94..." },
  { id: "email", label: "Email", placeholder: "mailto:brandhive.studio.lk@gmail.com", prefixExample: "mailto:..." },
  { id: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@brandhivestudio", prefixExample: "https://youtube.com/..." },
  { id: "twitter", label: "X / Twitter", placeholder: "https://x.com/brandhivestudio", prefixExample: "https://x.com/..." },
  { id: "github", label: "GitHub", placeholder: "https://github.com/brandhivestudio", prefixExample: "https://github.com/..." },
  { id: "other", label: "Other / Website", placeholder: "https://example.com", prefixExample: "https://..." },
];

export default function LinkForm({ initialData, isEdit = false, linkId }: LinkFormProps) {
  const router = useRouter();

  const [platform, setPlatform] = useState(initialData?.platform || "instagram");
  const [label, setLabel] = useState(initialData?.label || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive !== undefined ? Boolean(initialData.isActive) : true
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState(false);

  const selectedPreset = PLATFORM_OPTIONS.find((p) => p.id === platform.toLowerCase()) || PLATFORM_OPTIONS[PLATFORM_OPTIONS.length - 1];

  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform);
    // If label is currently empty or matches a preset name, auto-fill standard label
    const matchedOption = PLATFORM_OPTIONS.find((p) => p.id === newPlatform);
    if (matchedOption && (!label.trim() || PLATFORM_OPTIONS.some((p) => p.label === label))) {
      setLabel(matchedOption.label);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!platform.trim()) {
      setError("Please select or enter a platform.");
      return;
    }

    if (!label.trim()) {
      setError("Please enter a display label.");
      return;
    }

    if (!url.trim()) {
      setError("Please enter the target URL or contact string (e.g. https://... or tel:...).");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        platform: platform.trim().toLowerCase(),
        label: label.trim(),
        url: url.trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive,
      };

      const apiUrl = isEdit && linkId ? `/api/admin/links/${linkId}` : "/api/admin/links";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save external link.");
      }

      setSuccessNotice(true);
      setTimeout(() => {
        router.push("/admin/links");
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong saving the link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Top Navigation & Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/links"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all"
            aria-label="Back to external links"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#16C7FF]">
                {isEdit ? "Edit Link" : "New Link"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              {isEdit ? `Edit: ${initialData?.label || "External Link"}` : "Add External Link"}
            </h1>
          </div>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-all"
          >
            <ExternalLink className="size-3.5" />
            <span>Test Link</span>
          </a>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>External link saved successfully! Returning to list...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 md:p-8 rounded-3xl bg-[#090C12] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 size-72 bg-[#16C7FF]/5 blur-[90px] rounded-full pointer-events-none" />

          {/* Platform Preset & Custom Field */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center justify-between">
              <span>Platform Preset *</span>
              <span className="text-[10px] text-white/40 normal-case">Select channel icon & style</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {PLATFORM_OPTIONS.map((opt) => {
                const isSelected = platform.toLowerCase() === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePlatformChange(opt.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? "bg-[#16C7FF]/15 text-[#16C7FF] border-[#16C7FF]/40 shadow-[0_0_15px_rgba(22,199,255,0.15)]"
                        : "bg-white/[0.02] hover:bg-white/[0.05] text-white/60 hover:text-white border-white/5"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircle2 className="size-3.5 text-[#16C7FF]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70">
              Display Label *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Official Instagram, WhatsApp Support, Sri Lanka HQ"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50 focus:ring-1 focus:ring-[#16C7FF]/30 transition-all"
            />
            <p className="text-[11px] text-white/40">
              The human-readable title shown on buttons, tooltips, or footer menus.
            </p>
          </div>

          {/* URL / Contact String Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center justify-between">
              <span>Target URL or Action String *</span>
              <span className="text-[10px] text-white/40 normal-case">e.g. {selectedPreset.prefixExample}</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={selectedPreset.placeholder}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50 focus:ring-1 focus:ring-[#16C7FF]/30 transition-all font-mono text-xs sm:text-sm"
              />
            </div>
            <p className="text-[11px] text-white/40">
              Full destination: use <code className="text-[#16C7FF]">https://</code> for websites, <code className="text-[#16C7FF]">tel:</code> for phones, or <code className="text-[#16C7FF]">mailto:</code> for emails.
            </p>
          </div>

          {/* Two Columns: Display Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-white/5">
            {/* Display Order */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#16C7FF]/50 transition-all"
              />
              <p className="text-[11px] text-white/40">Lower numbers appear first (e.g. 1, 2, 3).</p>
            </div>

            {/* Active Switch */}
            <div className="space-y-2 flex flex-col justify-end">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                Live Status
              </label>
              <div
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-xs font-semibold">
                  {isActive ? "Active (Displayed on Website)" : "Inactive / Hidden (Draft)"}
                </span>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                    isActive ? "bg-emerald-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`size-4 rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/links"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold shadow-[0_0_20px_rgba(22,199,255,0.25)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{loading ? "Saving..." : isEdit ? "Update Link" : "Create Link"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
