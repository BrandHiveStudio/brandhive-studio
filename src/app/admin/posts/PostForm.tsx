"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  FileText,
  Upload,
  Sparkles,
  X,
  CheckCircle2,
  Tag,
} from "lucide-react";
import type { Post } from "@/lib/db/schema";

interface PostFormProps {
  initialData?: Partial<Post>;
  isEdit?: boolean;
  postId?: string;
}

const CATEGORIES = ["Branding", "Web Design", "Logo Design", "Marketing", "Business Growth"];

export default function PostForm({ initialData, isEdit = false, postId }: PostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [category, setCategory] = useState(initialData?.category || "Branding");
  const [customCategory, setCustomCategory] = useState("");
  const [author, setAuthor] = useState(initialData?.author || "BrandHive Studio");
  const [readTime, setReadTime] = useState(initialData?.readTime || "5 MIN READ");
  const [tagsInput, setTagsInput] = useState(() => {
    if (!initialData?.tags) return "Branding, Design";
    try {
      const parsed = JSON.parse(initialData.tags);
      return Array.isArray(parsed) ? parsed.join(", ") : initialData.tags;
    } catch {
      return initialData.tags;
    }
  });
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialData?.isFeatured));
  const [isPublished, setIsPublished] = useState<boolean>(
    initialData?.isPublished !== undefined ? Boolean(initialData.isPublished) : true
  );
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  // Upload cover image to Cloudflare R2
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "insights");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.url) {
        setCoverImage(data.url);
      } else {
        setError(data.error || "Failed to upload image to Cloudflare R2.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to upload API.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter the article title.");
      return;
    }

    if (!content.trim()) {
      setError("Please provide the article content.");
      return;
    }

    setLoading(true);

    try {
      const finalCategory =
        category === "Custom" && customCategory.trim() ? customCategory.trim() : category;

      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        category: finalCategory,
        author: author.trim() || "BrandHive Studio",
        readTime: readTime.trim() || "5 MIN READ",
        tags: JSON.stringify(parsedTags),
        isFeatured,
        isPublished,
        displayOrder: Number(displayOrder) || 0,
      };

      const url = isEdit && postId ? `/api/admin/posts/${postId}` : "/api/admin/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save article.");
      }

      setSuccessNotice(true);
      setTimeout(() => {
        router.push("/admin/posts");
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error saving article.");
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
            href="/admin/posts"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Back to Articles"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-[#16C7FF]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#16C7FF]">
                {isEdit ? "Edit Article" : "New Insight Entry"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              {isEdit ? "Update Article Content" : "Create New Article"}
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
          <span>{isEdit ? "Save Changes" : "Publish Article"}</span>
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
          <span>Article saved successfully! Returning to list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Main Content Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1218]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="size-4 text-[#16C7FF]" />
            <span>Article Overview</span>
          </h3>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="post-title" className="text-xs font-semibold text-white uppercase tracking-wider block">
              Article Title *
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Building Brands That Stand the Test of Time"
              className="w-full px-4 py-3 rounded-2xl bg-[#06090e] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all font-semibold"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label htmlFor="post-slug" className="text-xs font-semibold text-white uppercase tracking-wider block">
              URL Slug (Canonical) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-mono">/insights/</span>
              <input
                id="post-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManual(true);
                }}
                placeholder="building-brands-that-stand-the-test-of-time"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#06090e] border border-white/10 text-xs text-white/90 placeholder-white/30 font-mono focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label htmlFor="post-excerpt" className="text-xs font-semibold text-white uppercase tracking-wider block">
              Short Description / Excerpt
            </label>
            <textarea
              id="post-excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A punchy 1-2 sentence preview displayed on card grids and search engine meta descriptions..."
              className="w-full px-4 py-3 rounded-2xl bg-[#06090e] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Full Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="post-content" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Article Body Content *
              </label>
              <span className="text-[10px] text-white/40 font-mono">Supports Markdown &amp; Paragraphs</span>
            </div>
            <textarea
              id="post-content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write or paste your article content here. Use ## for section headings, - for bullet points, and blank lines between paragraphs..."
              className="w-full px-4 py-3.5 rounded-2xl bg-[#06090e] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all resize-y leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Card 2: Cover Image & Media */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1218]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Upload className="size-4 text-[#16C7FF]" />
            <span>Cover Image (Cloudflare R2)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Image Preview Box */}
            <div className="sm:col-span-5 aspect-[16/10] rounded-2xl bg-[#06090e] border border-white/10 relative overflow-hidden flex items-center justify-center">
              {coverImage ? (
                <>
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white/80 hover:text-white backdrop-blur-sm"
                    title="Remove image"
                  >
                    <X className="size-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="size-6 text-white/20 mx-auto mb-2" />
                  <span className="text-[11px] text-white/40 block">No cover image set</span>
                </div>
              )}
            </div>

            {/* Upload Inputs */}
            <div className="sm:col-span-7 space-y-3">
              <label className="text-xs font-semibold text-white/70 block">
                Upload New Image to Cloudflare R2
              </label>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 cursor-pointer transition-all">
                {uploadingImage ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="size-4 text-[#16C7FF]" />
                )}
                <span>{uploadingImage ? "Uploading to R2..." : "Select File to Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <div className="pt-2">
                <span className="text-[11px] text-white/40 block mb-1">Or paste direct image URL:</span>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... or /images/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Categorization & Metadata */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1218]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="size-4 text-[#16C7FF]" />
            <span>Category &amp; Publishing Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="post-cat" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Category
              </label>
              <select
                id="post-cat"
                value={CATEGORIES.includes(category) ? category : "Custom"}
                onChange={(e) => {
                  if (e.target.value === "Custom") {
                    setCategory("Custom");
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#16C7FF]/40 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0c1117] text-white">
                    {c}
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
                  placeholder="e.g. Technology"
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white"
                />
              )}
            </div>

            {/* Author */}
            <div className="space-y-2">
              <label htmlFor="post-author" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Author
              </label>
              <input
                id="post-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="BrandHive Studio"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#16C7FF]/40"
              />
            </div>

            {/* Read Time */}
            <div className="space-y-2">
              <label htmlFor="post-readtime" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Estimated Read Time
              </label>
              <input
                id="post-readtime"
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 7 MIN READ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#16C7FF]/40"
              />
            </div>
          </div>

          {/* Tags & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            <div className="sm:col-span-2 space-y-2">
              <label htmlFor="post-tags" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Tags (Comma separated)
              </label>
              <input
                id="post-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Branding, Strategy, Design Systems, UX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#16C7FF]/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="post-order" className="text-xs font-semibold text-white uppercase tracking-wider block">
                Display Order
              </label>
              <input
                id="post-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#06090e] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#16C7FF]/40"
              />
            </div>
          </div>

          {/* Switches: Featured & Published */}
          <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <h4 className="text-xs font-bold text-white">Featured Hero Spot</h4>
                <p className="text-[11px] text-white/50">Show as large spotlight article</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  isFeatured ? "bg-[#16C7FF]" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-[#050608] shadow transition duration-200 ${
                    isFeatured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <h4 className="text-xs font-bold text-white">Published Status</h4>
                <p className="text-[11px] text-white/50">Live on public website</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  isPublished ? "bg-emerald-400" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-[#050608] shadow transition duration-200 ${
                    isPublished ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/posts"
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
            <span>{isEdit ? "Update Article" : "Save and Publish"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
