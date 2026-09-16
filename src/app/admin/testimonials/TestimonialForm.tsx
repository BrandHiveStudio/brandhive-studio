"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, MessageSquareQuote, Loader2, Image as ImageIcon } from "lucide-react";

export interface TestimonialFormData {
  id?: string;
  clientName: string;
  company: string;
  role: string;
  review: string;
  logoUrl: string;
  displayOrder: number;
  isPublished: boolean;
}

interface TestimonialFormProps {
  initialData?: TestimonialFormData;
  isEditing?: boolean;
}

export default function TestimonialForm({ initialData, isEditing = false }: TestimonialFormProps) {
  const router = useRouter();

  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [review, setReview] = useState(initialData?.review || "");
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(initialData?.isPublished ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload logo or avatar to Cloudflare R2
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "testimonials");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.url) {
        setLogoUrl(data.url);
      } else {
        setError(data.error || "Failed to upload logo image to Cloudflare R2");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to upload API");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!clientName.trim() || !company.trim() || !review.trim()) {
      setError("Client Name, Company, and Review are required fields.");
      setSubmitting(false);
      return;
    }

    const payload = {
      clientName: clientName.trim(),
      company: company.trim(),
      role: role.trim(),
      review: review.trim(),
      logoUrl: logoUrl.trim() || null,
      displayOrder: Number(displayOrder) || 0,
      isPublished,
    };

    try {
      const url = isEditing ? `/api/admin/testimonials/${initialData?.id}` : "/api/admin/testimonials";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.ok) {
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        setError(data.error || "Failed to save testimonial.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 1. Client & Company Details */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquareQuote className="size-4 text-[#16C7FF]" />
          <span>Client & Company Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">
              Client / Person Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Umar Farook"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">
              Company / Business <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. UZEE TECH"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">
              Role / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Founder, CEO, Director"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-white/70 block mb-2">
            Display Order
          </label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
          />
        </div>
      </div>

      {/* 2. Review / Quote */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white">Testimonial Review Quote</h2>

        <div>
          <label className="text-xs font-semibold text-white/70 block mb-2">
            Review Content <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="What did the client say about BrandHive Studio's work and deliverables?..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#050608] border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#16C7FF]/50 transition-colors resize-y"
          />
        </div>
      </div>

      {/* 3. Company Logo / Brand Mark */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ImageIcon className="size-4 text-[#16C7FF]" />
          <span>Company Logo / Brand Badge</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {logoUrl ? (
            <div className="relative w-full sm:w-48 h-24 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center p-3 shrink-0">
              <Image src={logoUrl} alt="Company logo preview" fill className="object-contain p-2" sizes="192px" />
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 text-white transition-colors"
                title="Remove logo"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-full sm:w-48 h-24 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center text-center p-3 shrink-0">
              <ImageIcon className="size-6 text-white/30 mb-1" />
              <span className="text-[10px] text-white/40">No logo uploaded</span>
            </div>
          )}

          <div className="space-y-4 flex-1 w-full">
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-2">
                Logo URL (Cloudflare R2 or local asset path)
              </label>
              <input
                type="text"
                placeholder="https://pub-brandhive-studio-media.r2.dev/testimonials/... or /images/..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
              />
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
                {uploadingLogo ? <Loader2 className="size-3.5 animate-spin text-[#16C7FF]" /> : <Upload className="size-3.5" />}
                <span>{uploadingLogo ? "Uploading to R2..." : "Upload Logo to R2"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif"
                  className="hidden"
                  disabled={uploadingLogo}
                  onChange={handleLogoUpload}
                />
              </label>
              <p className="text-[11px] text-white/40 mt-1.5">
                Uploaded logo will be saved to Cloudflare R2 under <code className="text-[#16C7FF]">testimonials/</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Publication State */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="size-4 rounded bg-black/40 border-white/20 text-[#16C7FF] focus:ring-0"
          />
          <div>
            <span className="text-xs font-bold text-white block">Published on Website</span>
            <span className="text-[11px] text-white/50">
              When checked, this review will be actively displayed in the public Testimonials section.
            </span>
          </div>
        </label>
      </div>

      {/* 5. Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.push("/admin/testimonials")}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs hover:bg-[#16C7FF]/90 transition-all shadow-lg shadow-[#16C7FF]/20 active:scale-95 disabled:opacity-50"
        >
          {submitting && <Loader2 className="size-3.5 animate-spin" />}
          <span>{submitting ? "Saving Testimonial..." : isEditing ? "Update Testimonial" : "Create Testimonial"}</span>
        </button>
      </div>
    </form>
  );
}
