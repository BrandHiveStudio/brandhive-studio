"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  HelpCircle,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { BrainFaq } from "./types";
import { FAQ_CATEGORIES } from "./types";

interface BrainFaqsTabProps {
  faqs: BrainFaq[];
  onOpenCreate: () => void;
  onOpenEdit: (faq: BrainFaq) => void;
  onOpenDelete: (faq: BrainFaq) => void;
  onToggleActive: (faq: BrainFaq) => Promise<void> | void;
  togglingId: string | null;
}

export default function BrainFaqsTab({
  faqs,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  togglingId,
}: BrainFaqsTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      if (statusFilter === "active" && !f.isActive) return false;
      if (statusFilter === "inactive" && f.isActive) return false;
      if (categoryFilter !== "all" && f.category !== categoryFilter) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [faqs, search, categoryFilter, statusFilter]);

  // Unique categories in database
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => set.add(f.category));
    return Array.from(set);
  }, [faqs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search FAQs by question, answer, or category..."
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

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs hover:bg-[#16C7FF]/90 transition-all shadow-lg shadow-[#16C7FF]/20 active:scale-95 whitespace-nowrap"
        >
          <Plus className="size-3.5" />
          <span>New FAQ</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#090C12] border border-white/10 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === "all"
                ? "bg-[#16C7FF] text-black font-semibold"
                : "text-white/60 hover:text-white bg-white/[0.03]"
            }`}
          >
            All ({faqs.length})
          </button>
          {existingCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                categoryFilter === cat
                  ? "bg-[#16C7FF] text-black font-semibold"
                  : "text-white/60 hover:text-white bg-white/[0.03]"
              }`}
            >
              {cat} ({faqs.filter((f) => f.category === cat).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/40 text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-2.5 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <HelpCircle className="size-7" />
          </div>
          <h3 className="text-base font-bold text-white">No FAQs found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 mb-6">
            {search || categoryFilter !== "all" || statusFilter !== "all"
              ? "No FAQs match the current filter selection."
              : "No FAQ knowledge items found in Turso. Create your first FAQ."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedIds[faq.id] ?? false;

            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-[#090C12] border border-white/10 hover:border-white/20 transition-all overflow-hidden shadow-md"
              >
                {/* FAQ Summary Header */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div
                    onClick={() => toggleExpand(faq.id)}
                    className="flex-1 cursor-pointer flex items-start gap-3 select-none"
                  >
                    <div className="size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <HelpCircle className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-white/60 capitalize">
                          {faq.category}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">
                          Order: {faq.displayOrder}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm hover:text-[#16C7FF] transition-colors">
                        {faq.question}
                      </h4>
                      {!isExpanded && (
                        <p className="text-xs text-white/50 line-clamp-1">{faq.answer}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleActive(faq)}
                      disabled={togglingId === faq.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                        faq.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          faq.isActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"
                        }`}
                      />
                      <span>{faq.isActive ? "Active" : "Disabled"}</span>
                    </button>

                    <button
                      onClick={() => onOpenEdit(faq)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="size-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenDelete(faq)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-white/70 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>

                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white"
                      aria-label="Toggle answer details"
                    >
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-white/[0.01]">
                    <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/5 text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
