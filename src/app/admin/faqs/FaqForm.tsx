"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import type { Faq } from "@/lib/db/schema";

interface FaqFormProps {
  initialData?: Partial<Faq>;
  isEdit?: boolean;
  faqId?: string;
}

const CATEGORIES = [
  "General",
  "Services",
  "Process",
  "Timeline",
  "Pricing",
  "Development",
  "Support",
];

export default function FaqForm({ initialData, isEdit = false, faqId }: FaqFormProps) {
  const router = useRouter();

  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");
  const [category, setCategory] = useState(initialData?.category || "General");
  const [customCategory, setCustomCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(
    initialData?.isPublished !== undefined ? Boolean(initialData.isPublished) : true
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!question.trim()) {
      setError("Please enter the FAQ question.");
      return;
    }

    if (!answer.trim()) {
      setError("Please provide the answer text.");
      return;
    }

    setLoading(true);

    try {
      const finalCategory = category === "Custom" && customCategory.trim() ? customCategory.trim() : category;

      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: finalCategory,
        displayOrder: Number(displayOrder) || 0,
        isPublished,
      };

      const url = isEdit && faqId ? `/api/admin/faqs/${faqId}` : "/api/admin/faqs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save FAQ.");
      }

      setSuccessNotice(true);
      setTimeout(() => {
        router.push("/admin/faqs");
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong saving FAQ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/faqs"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Back to FAQs"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="size-4 text-[#16C7FF]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#16C7FF]">
                {isEdit ? "Edit FAQ" : "New FAQ Entry"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              {isEdit ? "Update Question & Answer" : "Add FAQ Question"}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] font-bold text-xs shadow-[0_0_20px_rgba(22,199,255,0.25)] transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="size-4 border-2 border-[#050608]/30 border-t-[#050608] rounded-full animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <span>{isEdit ? "Save Changes" : "Publish FAQ"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-3">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-3">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>FAQ saved successfully! Returning to list...</span>
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1218]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <label htmlFor="faq-question" className="text-xs font-semibold text-white uppercase tracking-wider block">
              Question Title *
            </label>
            <input
              id="faq-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How long does a typical branding project take?"
              className="w-full px-4 py-3 rounded-2xl bg-[#06090e] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all"
            />
          </div>

          {/* Answer Textarea */}
          <div className="space-y-2">
            <label htmlFor="faq-answer" className="text-xs font-semibold text-white uppercase tracking-wider block">
              Answer Content *
            </label>
            <textarea
              id="faq-answer"
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a concise, professional answer explaining BrandHive Studio's approach, timelines, or specifications..."
              className="w-full px-4 py-3 rounded-2xl bg-[#06090e] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Category & Display Order Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Category selection */}
            <div className="space-y-2">
              <label htmlFor="faq-category" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Category
              </label>
              <select
                id="faq-category"
                value={CATEGORIES.includes(category) ? category : "Custom"}
                onChange={(e) => {
                  if (e.target.value === "Custom") {
                    setCategory("Custom");
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[#06090e] border border-white/10 text-sm text-white focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0c1117] text-white">
                    {cat}
                  </option>
                ))}
                <option value="Custom" className="bg-[#0c1117] text-white">
                  + Custom Category...
                </option>
              </select>

              {category === "Custom" && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40"
                />
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <label htmlFor="faq-order" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Display Order
              </label>
              <input
                id="faq-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-2xl bg-[#06090e] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all font-mono"
              />
              <span className="text-[11px] text-white/40 block">
                Lower numbers appear first on the public website.
              </span>
            </div>
          </div>

          {/* Published Toggle Switch */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Published Status</h4>
              <p className="text-xs text-white/50 mt-0.5">
                When active, this FAQ item is visible to visitors on the website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublished ? "bg-[#16C7FF]" : "bg-white/10"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-[#050608] shadow ring-0 transition duration-200 ease-in-out ${
                  isPublished ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/faqs"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] font-bold text-xs shadow-[0_0_20px_rgba(22,199,255,0.25)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="size-4 border-2 border-[#050608]/30 border-t-[#050608] rounded-full animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isEdit ? "Update FAQ Entry" : "Save and Publish"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
