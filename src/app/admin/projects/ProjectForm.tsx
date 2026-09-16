"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Check,
  ExternalLink,
  AlertCircle,
  ImageIcon,
  Sparkles,
  Loader2,
} from "lucide-react";

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  caption?: string;
  section?: string;
  displayOrder?: number;
}

export interface ProjectFormData {
  id?: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  logoImage: string;
  client: string;
  role: string;
  year: string;
  deliverables: string[];
  isFeatured: boolean;
  isOngoing: boolean;
  isPublished: boolean;
  displayOrder: number;
  images: GalleryItem[];
}

const COMMON_CATEGORIES = [
  "Branding & Web Development",
  "Brand Identity & Logistics Design",
  "Packaging & Brand Identity",
  "Branding & UI/UX Design",
  "Luxury Branding & UI/UX",
  "Real Estate Branding & Identity",
  "Travel Booking & Experience",
  "Travel Management & Customer Experience",
  "E-commerce Platform",
  "Hospitality & Booking System",
  "Desktop HR Automation",
  "Employee Communication",
  "Cafeteria Management Dashboard",
  "Secure Transaction Platform",
  "Mobile Quiz & Gamification",
  "Task Management & Productivity",
];

export default function ProjectForm({
  initialData,
  isEdit = false,
}: {
  initialData?: Partial<ProjectFormData>;
  isEdit?: boolean;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialData?.slug));
  const [category, setCategory] = useState(initialData?.category || "Branding & Web Development");
  const [customCategory, setCustomCategory] = useState("");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [logoImage, setLogoImage] = useState(initialData?.logoImage || "");
  const [clientName, setClientName] = useState(initialData?.client || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear().toString());
  const [deliverables, setDeliverables] = useState<string[]>(initialData?.deliverables || []);
  const [newTag, setNewTag] = useState("");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isOngoing, setIsOngoing] = useState(initialData?.isOngoing || false);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished !== undefined ? initialData.isPublished : true);
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder || 0);
  const [images, setImages] = useState<GalleryItem[]>(initialData?.images || []);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-generate slug from title if not manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustomized) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Upload handler for single image (Cover or Logo)
  const handleImageUpload = async (
    file: File,
    type: "cover" | "logo"
  ) => {
    const isCover = type === "cover";
    if (isCover) setUploadingCover(true);
    else setUploadingLogo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", `portfolio/${slug || "general"}`);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image to R2.");
      }

      if (isCover) {
        setCoverImage(data.url);
      } else {
        setLogoImage(data.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setError(msg);
    } finally {
      if (isCover) setUploadingCover(false);
      else setUploadingLogo(false);
    }
  };

  // Upload handler for Gallery images
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setError(null);

    try {
      const newItems: GalleryItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", `portfolio/${slug || "gallery"}`);

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          newItems.push({
            imageUrl: data.url,
            caption: file.name.replace(/\.[^/.]+$/, ""),
            section: "Gallery",
            displayOrder: images.length + newItems.length,
          });
        }
      }
      setImages([...images, ...newItems]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload gallery images.";
      setError(msg);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const tag = newTag.trim();
    if (tag && !deliverables.includes(tag)) {
      setDeliverables([...deliverables, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDeliverables(deliverables.filter((t) => t !== tagToRemove));
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const finalCategory = category === "Custom..." ? customCategory.trim() : category;

    if (!title.trim()) {
      setError("Project title is required.");
      setSaving(false);
      return;
    }

    if (!slug.trim()) {
      setError("Project slug is required.");
      setSaving(false);
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category: finalCategory || "General",
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      coverImage: coverImage.trim(),
      logoImage: logoImage.trim(),
      client: clientName.trim(),
      role: role.trim(),
      year: year.trim(),
      deliverables,
      isFeatured,
      isOngoing,
      isPublished,
      displayOrder: Number(displayOrder) || 0,
      images,
    };

    try {
      const url = isEdit
        ? `/api/admin/projects/${initialData?.id}`
        : "/api/admin/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save project.");
      }

      setSuccess(`Project ${isEdit ? "updated" : "created"} successfully!`);
      setTimeout(() => {
        router.push("/admin/projects");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Projects</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isEdit ? `Edit: ${initialData?.title}` : "Create New Project"}
          </h1>
          <p className="text-xs text-white/50 mt-1">
            {isEdit ? "Update case study details and assets." : "Add a new portfolio case study to BrandHive Studio."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {slug && (
            <Link
              href={`/portfolio/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white transition-colors"
            >
              <ExternalLink className="size-3.5 text-white/50" />
              <span>Preview Page</span>
            </Link>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-xs hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(22,199,255,0.3)]"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                <span>{isEdit ? "Save Changes" : "Create Project"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="size-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
          <Check className="size-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="size-4 text-[#16C7FF]" />
            <span>Primary Case Study Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Project Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. UZEE TECH"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                URL Slug * (auto-generated)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-white/30 font-mono">
                  /portfolio/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setIsSlugCustomized(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"));
                  }}
                  placeholder="uzee-tech"
                  className="w-full pl-24 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#16C7FF] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0E131F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Custom...">Custom Category...</option>
            </select>

            {category === "Custom..." && (
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                className="w-full mt-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Short Description (Card Summary) *
            </label>
            <textarea
              rows={2}
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary displayed on portfolio cards..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Full Case Study Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the agency's strategy, design execution, and client impact..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Metadata & Deliverables */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-5">
          <h2 className="text-base font-semibold text-white">Client Metadata & Deliverables</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Client Name / Company</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Umar Farook"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Client Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Founder"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Project Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Deliverables / Tags (press Enter to add)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. Brand Strategy, Web Design"
                className="flex-1 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {deliverables.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#16C7FF]/10 text-[#16C7FF] border border-[#16C7FF]/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {deliverables.length === 0 && (
                <span className="text-xs text-white/30 italic">No deliverable tags added yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Media Uploads (Cloudflare R2) */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ImageIcon className="size-4 text-[#16C7FF]" />
              <span>Project Media (Cloudflare R2)</span>
            </h2>
            <span className="text-[11px] text-white/40 font-mono">Max: 10MB • Auto Web-Optimized</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover Image */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-white/70">
                Cover Showcase Image *
              </label>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex flex-col items-center justify-center group">
                {coverImage ? (
                  <>
                    <Image
                      src={coverImage}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#16C7FF] text-black font-semibold text-xs shadow-lg">
                        Replace Cover
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "cover");
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white font-medium text-xs hover:bg-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full h-full hover:bg-white/[0.02] transition-colors">
                    {uploadingCover ? (
                      <div className="flex flex-col items-center gap-2 text-[#16C7FF]">
                        <Loader2 className="size-6 animate-spin" />
                        <span className="text-xs">Uploading to R2...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="size-6 text-white/40 mb-2" />
                        <span className="text-xs font-medium text-white/70">Upload Cover Image</span>
                        <span className="text-[10px] text-white/30 mt-1">Recommended 16:10 aspect ratio</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "cover");
                      }}
                    />
                  </label>
                )}
              </div>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70 font-mono"
              />
            </div>

            {/* Logo Image */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-white/70">
                Client Brand Logo
              </label>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex flex-col items-center justify-center group">
                {logoImage ? (
                  <>
                    <div className="relative size-20 rounded-2xl bg-white p-3 shadow-lg flex items-center justify-center">
                      <Image
                        src={logoImage}
                        alt="Logo Preview"
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#16C7FF] text-black font-semibold text-xs shadow-lg">
                        Replace Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "logo");
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setLogoImage("")}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white font-medium text-xs hover:bg-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full h-full hover:bg-white/[0.02] transition-colors">
                    {uploadingLogo ? (
                      <div className="flex flex-col items-center gap-2 text-[#16C7FF]">
                        <Loader2 className="size-6 animate-spin" />
                        <span className="text-xs">Uploading to R2...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="size-6 text-white/40 mb-2" />
                        <span className="text-xs font-medium text-white/70">Upload Brand Logo</span>
                        <span className="text-[10px] text-white/30 mt-1">PNG or SVG with transparent background</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "logo");
                      }}
                    />
                  </label>
                )}
              </div>
              <input
                type="text"
                value={logoImage}
                onChange={(e) => setLogoImage(e.target.value)}
                placeholder="Or paste logo URL..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70 font-mono"
              />
            </div>
          </div>

          {/* Gallery Images */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-white/70">
                  Case Study Gallery Assets
                </label>
                <span className="text-[11px] text-white/40">
                  Additional visuals shown in the project detail view.
                </span>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white transition-colors">
                <Upload className="size-3.5" />
                <span>{uploadingGallery ? "Uploading..." : "Add Images"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                />
              </label>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 group"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.caption || `Gallery asset ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="250px"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="self-end p-1 rounded-md bg-rose-500 text-white"
                      >
                        <X className="size-3" />
                      </button>
                      <input
                        type="text"
                        value={img.section || "Gallery"}
                        onChange={(e) => {
                          const updated = [...images];
                          updated[idx].section = e.target.value;
                          setImages(updated);
                        }}
                        placeholder="Section..."
                        className="w-full px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white/80 border border-white/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-xs text-white/30">
                No gallery images added yet. Click &quot;Add Images&quot; to upload case study visuals.
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Publishing & Visibility */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#090C12] border border-white/10 space-y-5">
          <h2 className="text-base font-semibold text-white">Publishing & Ordering</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Published Toggle */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Publication Status</div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  {isPublished ? "Visible to public visitors" : "Saved as draft (hidden)"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? "bg-emerald-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPublished ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Featured Toggle */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Featured Project</div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  Top showcase card on Portfolio
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isFeatured ? "bg-[#16C7FF]" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isFeatured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Ongoing Toggle */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Ongoing Status</div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  Displays &quot;Ongoing Project&quot; tag
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOngoing(!isOngoing)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOngoing ? "bg-[#16C7FF]" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isOngoing ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Display Sort Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-48 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-[#16C7FF] transition-colors"
            />
            <p className="text-[11px] text-white/40 mt-1">
              Lower numbers appear first on the portfolio list (e.g. 1, 2, 3).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/projects"
            className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-xs hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(22,199,255,0.3)]"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                <span>{isEdit ? "Save Changes" : "Create Project"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
