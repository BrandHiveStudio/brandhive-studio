"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Search,
  MessageSquareQuote,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

interface TestimonialItem {
  id: string;
  clientName: string;
  company: string;
  role: string | null;
  review: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
  updatedAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<TestimonialItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (data.ok && Array.isArray(data.testimonials)) {
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Quick Publish Toggle
  const handleTogglePublish = async (item: TestimonialItem) => {
    const nextState = !item.isPublished;
    setTogglingId(item.id);

    try {
      const res = await fetch(`/api/admin/testimonials/${item.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextState }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, isPublished: nextState } : t))
        );
      }
    } catch (err) {
      console.error("Error toggling publish status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/testimonials/${deleteItem.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== deleteItem.id));
        setDeleteItem(null);
      } else {
        setDeleteError(data.error || "Failed to delete testimonial");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Network error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Testimonials
  const filteredTestimonials = useMemo(() => {
    if (!searchQuery.trim()) return testimonials;
    const q = searchQuery.toLowerCase();
    return testimonials.filter(
      (t) =>
        t.clientName.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        (t.role && t.role.toLowerCase().includes(q)) ||
        t.review.toLowerCase().includes(q)
    );
  }, [testimonials, searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Testimonials CMS
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Manage client reviews, quotes, and social proof shown on the homepage.
          </p>
        </div>

        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs sm:text-sm hover:bg-[#16C7FF]/90 transition-all shadow-lg shadow-[#16C7FF]/20 active:scale-95 whitespace-nowrap"
        >
          <Plus className="size-4" />
          <span>New Testimonial</span>
        </Link>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by client name, company, or review text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090C12] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>Total: <strong className="text-white">{testimonials.length}</strong></span>
          <span>•</span>
          <span>Published: <strong className="text-emerald-400">{testimonials.filter((t) => t.isPublished).length}</strong></span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <RefreshCw className="size-8 text-[#16C7FF] animate-spin mb-4" />
          <p className="text-sm font-medium text-white/70">Loading testimonials from Turso database...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <MessageSquareQuote className="size-7" />
          </div>
          <h3 className="text-base font-bold text-white">No testimonials found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 mb-6">
            {searchQuery
              ? "No reviews match your search query."
              : "You have not added any testimonials yet."}
          </p>
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs hover:bg-[#16C7FF]/90 transition-all shadow-md shadow-[#16C7FF]/20"
          >
            <Plus className="size-4" />
            <span>Add First Testimonial</span>
          </Link>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block rounded-3xl bg-[#090C12] border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-4 px-6">Client & Company</th>
                  <th className="py-4 px-4">Review Quote</th>
                  <th className="py-4 px-4">Brand Logo</th>
                  <th className="py-4 px-4">Order</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTestimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Client & Company */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-white text-sm">{t.clientName}</p>
                        <p className="text-[11px] text-[#16C7FF] font-medium mt-0.5">
                          {t.role ? `${t.role}, ` : ""}{t.company}
                        </p>
                      </div>
                    </td>

                    {/* Review Snippet */}
                    <td className="py-4 px-4 max-w-md">
                      <p className="line-clamp-2 text-white/70 italic text-xs leading-relaxed">
                        &ldquo;{t.review}&rdquo;
                      </p>
                    </td>

                    {/* Brand Logo */}
                    <td className="py-4 px-4">
                      {t.logoUrl ? (
                        <div className="relative w-16 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-1">
                          <Image
                            src={t.logoUrl}
                            alt={t.company}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>

                    {/* Order */}
                    <td className="py-4 px-4 font-mono font-semibold text-white/80">
                      {t.displayOrder}
                    </td>

                    {/* Publish Switch */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(t)}
                        disabled={togglingId === t.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          t.isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {t.isPublished ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        <span>{t.isPublished ? "Published" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/testimonials/${t.id}`}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                          title="Edit Testimonial"
                        >
                          <Edit2 className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteItem(t)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-white/70 hover:text-rose-400 transition-colors"
                          title="Delete Testimonial"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS */}
          <div className="md:hidden space-y-4">
            {filteredTestimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-[#090C12] border border-white/10 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{t.clientName}</h3>
                    <p className="text-[11px] text-[#16C7FF] font-medium">
                      {t.role ? `${t.role}, ` : ""}{t.company}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePublish(t)}
                    disabled={togglingId === t.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                      t.isPublished
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    <span>{t.isPublished ? "Live" : "Draft"}</span>
                  </button>
                </div>

                <p className="text-xs text-white/70 italic leading-relaxed">
                  &ldquo;{t.review}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <span className="text-white/40 text-[11px]">
                    Order: <strong className="text-white font-mono">{t.displayOrder}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/testimonials/${t.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="size-3" />
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteItem(t)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="size-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0C1017] border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Testimonial</h3>
                <p className="text-xs text-white/50">This action will remove the review from Turso.</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Are you sure you want to delete the testimonial from{" "}
              <strong className="text-white">&ldquo;{deleteItem.clientName}&rdquo;</strong> ({deleteItem.company})?
            </p>

            {deleteError && (
              <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-4">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteItem(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-lg shadow-rose-500/20"
              >
                {deleting ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>{deleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
