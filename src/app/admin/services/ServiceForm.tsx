"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Plus, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";

export interface ServiceFormData {
  id?: string;
  title: string;
  slug: string;
  badge: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  features: string[];
  tags: string[];
  displayOrder: number;
  isPublished: boolean;
}

interface ServiceFormProps {
  initialData?: ServiceFormData;
  isEditing?: boolean;
}

export default function ServiceForm({ initialData, isEditing = false }: ServiceFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [badge, setBadge] = useState(initialData?.badge || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [featureInput, setFeatureInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(initialData?.isPublished ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title if user hasn't manually entered one
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  // Add feature bullet
  const addFeature = () => {
    if (!featureInput.trim()) return;
    if (!features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
    }
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Add tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Upload image to Cloudflare R2
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "services");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error || "Failed to upload image to Cloudflare R2");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to upload API");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Title and Description are required fields.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      badge: badge.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      features,
      tags,
      displayOrder: Number(displayOrder) || 0,
      isPublished,
    };

    try {
      const url = isEditing ? `/api/admin/services/${initialData?.id}` : "/api/admin/services";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.ok) {
        router.push("/admin/services");
        router.refresh();
      } else {
        setError(data.error || "Failed to save service.");
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

      {/* 1. Core Service Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="size-4 text-[#16C7FF]" />
          <span>Core Service Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">
              Service Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Brand Strategy & Identity Systems"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">
              URL Slug <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="brand-strategy-identity-systems"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">
              Badge Label
            </label>
            <input
              type="text"
              placeholder="e.g. BRAND FOUNDATION, DIGITAL EXPERIENCES"
              value={badge}
              onChange={(e) => setBadge(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs uppercase tracking-wider focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-white/70 block mb-2">
            Short Description (for cards / summary)
          </label>
          <input
            type="text"
            placeholder="Concise one-line summary..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/70 block mb-2">
            Full Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Comprehensive description of the service and customer value proposition..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#050608] border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#16C7FF]/50 transition-colors resize-y"
          />
        </div>
      </div>

      {/* 2. Media / Showcase Image */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ImageIcon className="size-4 text-[#16C7FF]" />
          <span>Showcase Mockup / Cover Image</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {imageUrl ? (
            <div className="relative w-full sm:w-64 aspect-[4/3] rounded-2xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
              <Image src={imageUrl} alt="Service preview" fill className="object-cover" sizes="256px" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 text-white transition-colors"
                title="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-full sm:w-64 aspect-[4/3] rounded-2xl border border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center text-center p-4 shrink-0">
              <ImageIcon className="size-8 text-white/30 mb-2" />
              <span className="text-[11px] text-white/40">No showcase image selected</span>
            </div>
          )}

          <div className="space-y-4 flex-1 w-full">
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-2">
                Image URL (Cloudflare R2 or local path)
              </label>
              <input
                type="text"
                placeholder="https://pub-brandhive-studio-media.r2.dev/services/... or /images/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
              />
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
                {uploadingImage ? <Loader2 className="size-3.5 animate-spin text-[#16C7FF]" /> : <Upload className="size-3.5" />}
                <span>{uploadingImage ? "Uploading to R2..." : "Upload from Device to R2"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                />
              </label>
              <p className="text-[11px] text-white/40 mt-1.5">
                Uploaded image will be automatically streamed to Cloudflare R2 under <code className="text-[#16C7FF]">services/</code> folder.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Features & Deliverables */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white">Features & Deliverables</h2>

        {/* Features list */}
        <div>
          <label className="text-xs font-semibold text-white/70 block mb-2">
            Deliverables / Features Highlights (displayed on service card)
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Brand Positioning, Visual Identity Design..."
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#16C7FF] hover:text-black text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {features.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#11161C] border border-white/10 text-white/80"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-white/40 hover:text-rose-400 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tags list */}
        <div>
          <label className="text-xs font-semibold text-white/70 block mb-2">
            Categorization Tags
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Branding, Next.js, Strategy..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#050608] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#16C7FF] hover:text-black text-white text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="text-white/40 hover:text-rose-400 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
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
              When checked, this service will be actively rendered on the public website.
            </span>
          </div>
        </label>
      </div>

      {/* 5. Submit Controls */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
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
          <span>{submitting ? "Saving Service..." : isEditing ? "Update Service" : "Create Service"}</span>
        </button>
      </div>
    </form>
  );
}
