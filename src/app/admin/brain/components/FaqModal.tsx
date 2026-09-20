"use client";

import React, { useState, useEffect } from "react";
import { X, RefreshCw, HelpCircle, AlertCircle } from "lucide-react";
import type { BrainFaq } from "./types";
import { FAQ_CATEGORIES } from "./types";

interface FaqModalProps {
  isOpen: boolean;
  faq: BrainFaq | null;
  onClose: () => void;
  onSave: (savedFaq: BrainFaq) => void;
}

export default function FaqModal({ isOpen, faq, onClose, onSave }: FaqModalProps) {
  const isEdit = Boolean(faq);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("general");
  const [customCategory, setCustomCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question);
      setAnswer(faq.answer);
      const isKnown = (FAQ_CATEGORIES as readonly string[]).includes(faq.category);
      if (isKnown) {
        setCategory(faq.category);
        setCustomCategory("");
      } else {
        setCategory("custom");
        setCustomCategory(faq.category);
      }
      setIsActive(faq.isActive);
      setDisplayOrder(faq.displayOrder);
    } else {
      setQuestion("");
      setAnswer("");
      setCategory("general");
      setCustomCategory("");
      setIsActive(true);
      setDisplayOrder(0);
    }
    setError(null);
  }, [faq, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!question.trim()) {
      setError("Question is required.");
      return;
    }

    if (!answer.trim()) {
      setError("Answer is required.");
      return;
    }

    const finalCategory = category === "custom" ? customCategory.trim() : category;
    if (!finalCategory) {
      setError("Please specify a category.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: finalCategory,
        isActive,
        displayOrder: Number(displayOrder) || 0,
      };

      const url = isEdit ? `/api/admin/brain/faqs/${faq!.id}` : "/api/admin/brain/faqs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save FAQ");
      }

      onSave(data.faq);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error while saving FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl my-8 bg-[#090C12] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? "Edit Knowledge FAQ" : "New Knowledge FAQ"}
              </h2>
              <p className="text-xs text-white/50">Authoritative question & answer pair for HIVE AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50 capitalize"
            >
              {FAQ_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#090C12] text-white capitalize">
                  {c}
                </option>
              ))}
              <option value="custom" className="bg-[#090C12] text-white">
                + Custom Category...
              </option>
            </select>
            {category === "custom" && (
              <input
                type="text"
                placeholder="e.g. payment-terms"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none"
              />
            )}
          </div>

          {/* Question */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">
              Question <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Do you provide ongoing maintenance for web development projects?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50 resize-none"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">
              Answer <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Provide the comprehensive authoritative answer for HIVE AI to use when responding to clients..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50 resize-y"
            />
          </div>

          {/* Active status & Order */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <label className="font-medium text-white/70">Display Order:</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 text-white focus:outline-none text-center"
              />
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded bg-[#0B0F19] border-white/20 text-[#16C7FF] focus:ring-[#16C7FF]/30 size-4"
              />
              <span className="font-semibold text-emerald-400">Active in Knowledge Base</span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0B0F19]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#16C7FF] hover:bg-[#16C7FF]/90 text-black shadow-lg shadow-[#16C7FF]/20 transition-all disabled:opacity-50"
          >
            {loading && <RefreshCw className="size-3.5 animate-spin" />}
            <span>{loading ? "Saving..." : isEdit ? "Save Changes" : "Create FAQ"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
