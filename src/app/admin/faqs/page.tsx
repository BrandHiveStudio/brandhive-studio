"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import type { Faq } from "@/lib/db/schema";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Deletion modal state
  const [deleteItem, setDeleteItem] = useState<Faq | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [faqs]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesSearch =
        !search.trim() ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || f.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && f.isPublished) ||
        (statusFilter === "draft" && !f.isPublished);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [faqs, search, selectedCategory, statusFilter]);

  // Quick toggle publish/draft
  const handleTogglePublish = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/faqs/${id}/publish`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isPublished: data.faq.isPublished } : item))
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
      const res = await fetch(`/api/admin/faqs/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFaqs((prev) => prev.filter((item) => item.id !== deleteItem.id));
        setDeleteItem(null);
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#16C7FF]/10 flex items-center justify-center text-[#16C7FF]">
              <HelpCircle className="size-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#16C7FF]">
              FAQ CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-xl">
            Manage public FAQ accordions, helpful client answers, display ordering, and category groupings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFaqs()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
            title="Refresh FAQs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#16C7FF]" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/faqs/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold shadow-[0_0_18px_rgba(22,199,255,0.25)] transition-all"
          >
            <Plus className="size-4" />
            <span>Add New FAQ</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_12px_rgba(22,199,255,0.1)]"
                : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5"
            }`}
          >
            All Categories ({faqs.length})
          </button>
          {categories.map((cat) => {
            const count = faqs.filter((f) => f.category === cat).length;
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_12px_rgba(22,199,255,0.1)]"
                    : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5"
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] text-white/40">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right side: Status Filter & Search */}
        <div className="flex items-center gap-3">
          {/* Published / Draft Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
            className="bg-[#0d1218]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#16C7FF]/40 cursor-pointer"
          >
            <option value="all" className="bg-[#0c1017]">All Statuses</option>
            <option value="published" className="bg-[#0c1017]">Published Only</option>
            <option value="draft" className="bg-[#0c1017]">Drafts Only</option>
          </select>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1218]/90 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#16C7FF]/40 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main FAQ Table / Cards */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-[#0d1218]/50 rounded-2xl border border-white/5">
          <div className="size-7 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
          <p className="text-xs text-white/40">Loading FAQs from Turso...</p>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="p-16 text-center bg-[#0d1218]/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30">
            <HelpCircle className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-white/80">No FAQs found</h3>
          <p className="text-xs text-white/40 max-w-sm">
            {search
              ? "No questions matched your search criteria."
              : selectedCategory !== "all"
              ? `There are no FAQs under the '${selectedCategory}' category.`
              : "Get started by adding your first FAQ question."}
          </p>
          <Link
            href="/admin/faqs/new"
            className="mt-2 px-4 py-2 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>Add FAQ</span>
          </Link>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-[#0d1218]/70 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-16">Order</th>
                  <th className="py-3.5 px-4">Question &amp; Answer</th>
                  <th className="py-3.5 px-4 w-36">Category</th>
                  <th className="py-3.5 px-4 w-32">Status</th>
                  <th className="py-3.5 px-5 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredFaqs.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Order */}
                    <td className="py-4 px-5 font-mono text-white/50 text-xs">
                      #{item.displayOrder}
                    </td>

                    {/* Question & Answer preview */}
                    <td className="py-4 px-4 max-w-md">
                      <div className="font-semibold text-white text-sm mb-1 group-hover:text-[#16C7FF] transition-colors">
                        {item.question}
                      </div>
                      <p className="text-white/50 text-xs line-clamp-2 leading-relaxed font-normal">
                        {item.answer}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-white/80 border border-white/10">
                        {item.category}
                      </span>
                    </td>

                    {/* Status with Quick Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(item.id)}
                        disabled={togglingId === item.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          item.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {togglingId === item.id ? (
                          <div className="size-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span
                            className={`size-1.5 rounded-full ${
                              item.isPublished ? "bg-emerald-400 animate-pulse" : "bg-white/40"
                            }`}
                          />
                        )}
                        <span>{item.isPublished ? "Published" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/faqs/${item.id}`}
                          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit FAQ"
                        >
                          <Edit2 className="size-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete FAQ"
                        >
                          <Trash2 className="size-4" />
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
            {filteredFaqs.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white/40">#{item.displayOrder}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/70 border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTogglePublish(item.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      item.isPublished
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${item.isPublished ? "bg-emerald-400" : "bg-white/40"}`} />
                    <span>{item.isPublished ? "Published" : "Draft"}</span>
                  </button>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug">{item.question}</h4>
                <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">{item.answer}</p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/faqs/${item.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Edit2 className="size-3.5 text-[#16C7FF]" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/5"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 4. Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Trash2 className="size-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete FAQ?</h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Are you sure you want to permanently delete:
                <br />
                <span className="text-white font-semibold mt-1 block">
                  &ldquo;{deleteItem.question}&rdquo;
                </span>
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
