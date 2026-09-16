"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GitBranch,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Search as SearchIcon,
  CheckSquare,
  Palette,
  Code2,
  Rocket,
  Compass,
  Sparkles,
  Layers,
} from "lucide-react";
import type { ProcessStep } from "@/lib/db/schema";

function getStageIcon(iconName: string) {
  switch (iconName?.toLowerCase()) {
    case "strategy":
      return CheckSquare;
    case "design":
      return Palette;
    case "code":
      return Code2;
    case "launch":
      return Rocket;
    case "compass":
      return Compass;
    case "sparkles":
      return Sparkles;
    case "branch":
      return GitBranch;
    case "search":
    default:
      return SearchIcon;
  }
}

export default function AdminProcessPage() {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Deletion modal state
  const [deleteItem, setDeleteItem] = useState<ProcessStep | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status toggle tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSteps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/process");
      if (res.ok) {
        const data = await res.json();
        setSteps(data.steps || []);
      }
    } catch (err) {
      console.error("Failed to load process steps:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  // Filtered steps
  const filteredSteps = useMemo(() => {
    return steps.filter((s) => {
      const matchesSearch =
        !search.trim() ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.shortTitle && s.shortTitle.toLowerCase().includes(search.toLowerCase())) ||
        (s.badge && s.badge.toLowerCase().includes(search.toLowerCase())) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.stepNumber.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && s.isPublished) ||
        (statusFilter === "draft" && !s.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [steps, search, statusFilter]);

  // Quick toggle publish status
  const handleTogglePublish = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/process/${id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setSteps((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isPublished: data.step.isPublished } : item))
        );
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Safe delete
  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/process/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSteps((prev) => prev.filter((item) => item.id !== deleteItem.id));
        setDeleteItem(null);
      }
    } catch (err) {
      console.error("Failed to delete process step:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const publishedCount = steps.filter((s) => s.isPublished).length;
  const draftCount = steps.length - publishedCount;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#16C7FF]/10 flex items-center justify-center text-[#16C7FF]">
              <GitBranch className="size-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#16C7FF]">
              Workflow CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Process &amp; Workflow Stages
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-xl">
            Manage public agency workflow stages, deliverables, step numbers, and homepage process nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSteps()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all cursor-pointer"
            title="Refresh stages"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#16C7FF]" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/process/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold shadow-[0_0_18px_rgba(22,199,255,0.25)] transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add New Stage</span>
          </Link>
        </div>
      </div>

      {/* 2. Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-medium">Total Stages</span>
            <p className="text-xl font-bold text-white mt-0.5">{steps.length}</p>
          </div>
          <div className="size-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/70">
            <GitBranch className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-medium">Published Live</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{publishedCount}</p>
          </div>
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-medium">Draft Stages</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{draftCount}</p>
          </div>
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <XCircle className="size-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search stages, titles, badges..."
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
          className="bg-[#0d1218]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#16C7FF]/40 cursor-pointer"
        >
          <option value="all" className="bg-[#0c1017]">All Statuses</option>
          <option value="published" className="bg-[#0c1017]">Published Only</option>
          <option value="draft" className="bg-[#0c1017]">Drafts Only</option>
        </select>
      </div>

      {/* 4. Content Area: Table / Cards */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 bg-[#090C12]/50 border border-white/5 rounded-3xl">
          <div className="size-8 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
          <p className="text-xs text-white/40">Loading workflow stages from Turso...</p>
        </div>
      ) : filteredSteps.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-[#090C12]/50 border border-white/5 rounded-3xl">
          <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-4">
            <GitBranch className="size-6" />
          </div>
          <h3 className="text-base font-bold text-white">No process stages found</h3>
          <p className="text-xs text-white/50 mt-1 max-w-sm">
            {search || statusFilter !== "all"
              ? "Try adjusting your search keywords or status filter."
              : "Create your first workflow stage to display on the public site."}
          </p>
          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
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
          <div className="hidden lg:block overflow-hidden rounded-3xl bg-[#090C12] border border-white/10 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                  <th className="py-3.5 px-6 font-semibold w-24 text-center">Stage</th>
                  <th className="py-3.5 px-6 font-semibold">Title &amp; Badge</th>
                  <th className="py-3.5 px-6 font-semibold">Description</th>
                  <th className="py-3.5 px-6 font-semibold text-center w-28">Order</th>
                  <th className="py-3.5 px-6 font-semibold text-center w-36">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredSteps.map((step) => {
                  const Icon = getStageIcon(step.icon || "search");
                  let deliverablesList: string[] = [];
                  try {
                    deliverablesList = step.deliverables ? JSON.parse(step.deliverables) : [];
                  } catch {
                    deliverablesList = [];
                  }

                  return (
                    <tr
                      key={step.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Step Badge / Icon */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <div className="size-10 rounded-2xl bg-gradient-to-br from-[#16C7FF]/15 to-blue-500/10 border border-[#16C7FF]/30 flex items-center justify-center text-[#16C7FF] shadow-sm">
                            <Icon className="size-4.5" />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-white/70">
                            #{step.stepNumber}
                          </span>
                        </div>
                      </td>

                      {/* Title & Badge */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-xs">
                          {step.badge && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#16C7FF]/10 border border-[#16C7FF]/20 text-[9px] font-extrabold text-[#16C7FF] uppercase tracking-wider">
                              {step.badge}
                            </span>
                          )}
                          <div className="font-bold text-white text-sm">
                            {step.title}
                          </div>
                          {step.shortTitle && step.shortTitle !== step.title && (
                            <span className="text-[11px] text-white/40 block">
                              Node label: &ldquo;{step.shortTitle}&rdquo;
                            </span>
                          )}
                          {deliverablesList.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-white/40 pt-1">
                              <Layers className="size-3" />
                              <span>{deliverablesList.length} deliverables listed</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Description & Image Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3 max-w-md">
                          {step.imageUrl && (
                            <div className="relative size-12 rounded-xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
                              <Image
                                src={step.imageUrl}
                                alt={step.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            {step.shortDescription && (
                              <p className="text-[11px] text-[#16C7FF]/80 font-medium">
                                {step.shortDescription}
                              </p>
                            )}
                            <p className="text-white/60 line-clamp-2 leading-relaxed text-[11px]">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Display Order */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/5 font-mono text-xs text-white/80">
                          #{step.displayOrder ?? 0}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleTogglePublish(step.id)}
                          disabled={togglingId === step.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            step.isPublished
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                          } ${togglingId === step.id ? "opacity-50" : ""}`}
                        >
                          {togglingId === step.id ? (
                            <RefreshCw className="size-3 animate-spin" />
                          ) : step.isPublished ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <XCircle className="size-3" />
                          )}
                          <span>{step.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/process/${step.id}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition-all"
                            title="Edit Stage"
                          >
                            <Edit2 className="size-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteItem(step)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all cursor-pointer"
                            title="Delete Stage"
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

          {/* Mobile/Tablet Card View */}
          <div className="grid grid-cols-1 gap-3.5 lg:hidden">
            {filteredSteps.map((step) => {
              const Icon = getStageIcon(step.icon || "search");
              let deliverablesList: string[] = [];
              try {
                deliverablesList = step.deliverables ? JSON.parse(step.deliverables) : [];
              } catch {
                deliverablesList = [];
              }

              return (
                <div
                  key={step.id}
                  className="p-5 rounded-2xl bg-[#090C12] border border-white/10 space-y-3.5 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-gradient-to-br from-[#16C7FF]/15 to-blue-500/10 border border-[#16C7FF]/30 flex items-center justify-center text-[#16C7FF] shrink-0">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#16C7FF]">
                            Stage {step.stepNumber}
                          </span>
                          {step.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[9px] font-bold text-white/60">
                              {step.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {step.title}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-white/60">
                      #{step.displayOrder ?? 0}
                    </span>
                  </div>

                  {step.description && (
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {step.description}
                    </p>
                  )}

                  {deliverablesList.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                      <Layers className="size-3 text-[#16C7FF]" />
                      <span>{deliverablesList.length} deliverables configured</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleTogglePublish(step.id)}
                      disabled={togglingId === step.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border ${
                        step.isPublished
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-white/5 text-white/40 border-white/10"
                      }`}
                    >
                      {step.isPublished ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      <span>{step.isPublished ? "Published" : "Draft"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/process/${step.id}`}
                        className="p-2 rounded-xl bg-white/5 text-white/70 text-xs border border-white/5"
                      >
                        <Edit2 className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteItem(step)}
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
                <h3 className="text-base font-bold text-white">Delete Workflow Stage</h3>
              </div>
              <button
                onClick={() => setDeleteItem(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Are you sure you want to delete Stage {deleteItem.stepNumber} &ldquo;
              <strong className="text-white">{deleteItem.title}</strong>&rdquo;?
              This stage will immediately be removed from the database and public site.
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
