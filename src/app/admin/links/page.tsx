"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Link2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Share2,
} from "lucide-react";
import type { ExternalLink as ExternalLinkType } from "@/lib/db/schema";
import { PLATFORM_OPTIONS } from "./LinkForm";

// Helper to render platform icon or badge color
function getPlatformStyle(platform: string) {
  const p = platform.toLowerCase();
  switch (p) {
    case "whatsapp":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        icon: MessageCircle,
      };
    case "instagram":
      return {
        bg: "bg-pink-500/10",
        text: "text-pink-400",
        border: "border-pink-500/20",
        icon: Share2,
      };
    case "facebook":
      return {
        bg: "bg-blue-600/10",
        text: "text-blue-400",
        border: "border-blue-600/20",
        icon: Globe,
      };
    case "tiktok":
      return {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/20",
        icon: Share2,
      };
    case "linkedin":
      return {
        bg: "bg-sky-500/10",
        text: "text-sky-400",
        border: "border-sky-500/20",
        icon: Globe,
      };
    case "phone":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        icon: Phone,
      };
    case "email":
      return {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/20",
        icon: Mail,
      };
    default:
      return {
        bg: "bg-[#16C7FF]/10",
        text: "text-[#16C7FF]",
        border: "border-[#16C7FF]/20",
        icon: Link2,
      };
  }
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<ExternalLinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Deletion modal state
  const [deleteItem, setDeleteItem] = useState<ExternalLinkType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error("Failed to load links:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Extract unique platforms present in links
  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    links.forEach((l) => {
      if (l.platform) set.add(l.platform.toLowerCase());
    });
    return Array.from(set);
  }, [links]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      const matchesSearch =
        !search.trim() ||
        l.label.toLowerCase().includes(search.toLowerCase()) ||
        l.url.toLowerCase().includes(search.toLowerCase()) ||
        l.platform.toLowerCase().includes(search.toLowerCase());

      const matchesPlatform =
        selectedPlatform === "all" || l.platform.toLowerCase() === selectedPlatform.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && l.isActive) ||
        (statusFilter === "inactive" && !l.isActive);

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [links, search, selectedPlatform, statusFilter]);

  // Quick toggle active / inactive
  const handleToggleActive = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/links/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setLinks((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isActive: data.link.isActive } : item))
        );
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Safe delete
  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/links/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((item) => item.id !== deleteItem.id));
        setDeleteItem(null);
      }
    } catch (err) {
      console.error("Failed to delete link:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = links.filter((l) => l.isActive).length;
  const inactiveCount = links.length - activeCount;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#16C7FF]/10 flex items-center justify-center text-[#16C7FF]">
              <Link2 className="size-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#16C7FF]">
              External Links CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            External Links &amp; Socials
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-xl">
            Manage public social media links, WhatsApp redirects, and external touchpoints in Turso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLinks()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all cursor-pointer"
            title="Refresh Links"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#16C7FF]" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/links/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold shadow-[0_0_18px_rgba(22,199,255,0.25)] transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add New Link</span>
          </Link>
        </div>
      </div>

      {/* 2. Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-medium">Total Channels</span>
            <p className="text-xl font-bold text-white mt-0.5">{links.length}</p>
          </div>
          <div className="size-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/70">
            <Link2 className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-medium">Active on Site</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-medium">Inactive / Hidden</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{inactiveCount}</p>
          </div>
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <XCircle className="size-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedPlatform === "all"
                ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_12px_rgba(22,199,255,0.1)]"
                : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5"
            }`}
          >
            All Platforms ({links.length})
          </button>
          {availablePlatforms.map((plat) => {
            const count = links.filter((l) => l.platform.toLowerCase() === plat).length;
            const isActive = selectedPlatform.toLowerCase() === plat;
            const matchedLabel = PLATFORM_OPTIONS.find((p) => p.id === plat)?.label || plat;
            return (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer capitalize ${
                  isActive
                    ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_12px_rgba(22,199,255,0.1)]"
                    : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5"
                }`}
              >
                <span>{matchedLabel}</span>
                <span className="text-[10px] text-white/40">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Status Filter & Search */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="bg-[#0d1218]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#16C7FF]/40 cursor-pointer"
          >
            <option value="all" className="bg-[#0c1017]">All Statuses</option>
            <option value="active" className="bg-[#0c1017]">Active Only</option>
            <option value="inactive" className="bg-[#0c1017]">Inactive Only</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              placeholder="Search label, url, platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1218]/90 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#16C7FF]/40 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-white/40 hover:text-white cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Content Area: Table / Cards */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 bg-[#090C12]/50 border border-white/5 rounded-3xl">
          <div className="size-8 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
          <p className="text-xs text-white/40">Loading external links from Turso...</p>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-[#090C12]/50 border border-white/5 rounded-3xl">
          <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-4">
            <Link2 className="size-6" />
          </div>
          <h3 className="text-base font-bold text-white">No external links found</h3>
          <p className="text-xs text-white/50 mt-1 max-w-sm">
            {search || selectedPlatform !== "all" || statusFilter !== "all"
              ? "Try adjusting your search query or platform filters."
              : "Start by configuring your first social platform or external redirect."}
          </p>
          {(search || selectedPlatform !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedPlatform("all");
                setStatusFilter("all");
              }}
              className="mt-4 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-3xl bg-[#090C12] border border-white/10 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                  <th className="py-3.5 px-6 font-semibold">Platform &amp; Label</th>
                  <th className="py-3.5 px-6 font-semibold">Target URL / Action</th>
                  <th className="py-3.5 px-6 font-semibold text-center w-28">Display Order</th>
                  <th className="py-3.5 px-6 font-semibold text-center w-36">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredLinks.map((link) => {
                  const style = getPlatformStyle(link.platform);
                  const Icon = style.icon;

                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Platform & Label */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-9 rounded-xl flex items-center justify-center border shrink-0 ${style.bg} ${style.text} ${style.border}`}
                          >
                            <Icon className="size-4.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {link.label}
                            </div>
                            <span className="text-[11px] text-white/40 capitalize">
                              {link.platform}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* URL / Action Target */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 max-w-md">
                          <span className="font-mono text-white/70 truncate text-[11px]">
                            {link.url}
                          </span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-white/30 hover:text-[#16C7FF] transition-colors shrink-0"
                            title="Open link in new tab"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Display Order */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/5 font-mono text-xs text-white/80">
                          #{link.displayOrder ?? 0}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleActive(link.id)}
                          disabled={togglingId === link.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            link.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                          } ${togglingId === link.id ? "opacity-50" : ""}`}
                        >
                          {togglingId === link.id ? (
                            <RefreshCw className="size-3 animate-spin" />
                          ) : link.isActive ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <XCircle className="size-3" />
                          )}
                          <span>{link.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/links/${link.id}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition-all"
                            title="Edit Link"
                          >
                            <Edit2 className="size-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteItem(link)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all cursor-pointer"
                            title="Delete Link"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredLinks.map((link) => {
              const style = getPlatformStyle(link.platform);
              const Icon = style.icon;

              return (
                <div
                  key={link.id}
                  className="p-5 rounded-2xl bg-[#090C12] border border-white/10 space-y-3.5 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-8 rounded-xl flex items-center justify-center border shrink-0 ${style.bg} ${style.text} ${style.border}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white leading-tight">
                          {link.label}
                        </h4>
                        <span className="text-[10px] text-white/40 capitalize">
                          {link.platform}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-white/60">
                      #{link.displayOrder ?? 0}
                    </span>
                  </div>

                  {/* URL */}
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 text-xs font-mono text-white/70">
                    <span className="truncate">{link.url}</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#16C7FF] shrink-0"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      onClick={() => handleToggleActive(link.id)}
                      disabled={togglingId === link.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${
                        link.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-white/5 text-white/40 border-white/10"
                      }`}
                    >
                      {link.isActive ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      <span>{link.isActive ? "Active" : "Inactive"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/links/${link.id}`}
                        className="p-2 rounded-xl bg-white/5 text-white/70 text-xs border border-white/5"
                      >
                        <Edit2 className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteItem(link)}
                        className="p-2 rounded-xl bg-white/5 text-red-400 text-xs border border-white/5"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 5. Safe Deletion Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0C1017] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                  <Trash2 className="size-5" />
                </div>
                <h3 className="text-base font-bold text-white">Delete External Link</h3>
              </div>
              <button
                onClick={() => setDeleteItem(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-white">&ldquo;{deleteItem.label}&rdquo;</strong> ({deleteItem.platform})?
              This channel will immediately be removed from the database and public site.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
