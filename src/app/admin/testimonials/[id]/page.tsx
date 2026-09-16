"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareQuote, Loader2 } from "lucide-react";
import TestimonialForm, { TestimonialFormData } from "../TestimonialForm";

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [testimonial, setTestimonial] = useState<TestimonialFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTestimonial() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/testimonials/${id}`);
        const data = await res.json();
        if (data.ok && data.testimonial) {
          const t = data.testimonial;
          setTestimonial({
            id: t.id,
            clientName: t.clientName,
            company: t.company,
            role: t.role || "",
            review: t.review,
            logoUrl: t.logoUrl || "",
            displayOrder: t.displayOrder || 0,
            isPublished: Boolean(t.isPublished),
          });
        } else {
          setError(data.error || "Testimonial not found.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    }
    loadTestimonial();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center">
        <Loader2 className="size-8 text-[#16C7FF] animate-spin mb-4" />
        <p className="text-xs text-white/50">Loading testimonial details...</p>
      </div>
    );
  }

  if (error || !testimonial) {
    return (
      <div className="p-12 rounded-3xl bg-[#090C12] border border-white/10 text-center space-y-4">
        <p className="text-rose-400 text-sm font-semibold">{error || "Testimonial could not be found."}</p>
        <Link
          href="/admin/testimonials"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to Testimonials</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Testimonials</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
          <MessageSquareQuote className="size-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Testimonial</h1>
          <p className="text-xs text-white/50">{testimonial.clientName} — {testimonial.company}</p>
        </div>
      </div>

      <TestimonialForm initialData={testimonial} isEditing={true} />
    </div>
  );
}
