"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Plus,
  Loader2,
  Search,
  CheckSquare,
  Palette,
  Code2,
  Rocket,
  Compass,
  Sparkles,
  GitBranch,
} from "lucide-react";
import type { ProcessStep } from "@/lib/db/schema";

interface ProcessFormProps {
  initialData?: Partial<ProcessStep>;
  isEdit?: boolean;
  stepId?: string;
}

const ICON_PRESETS = [
  { id: "search", label: "Search / Discover", icon: Search },
  { id: "strategy", label: "Clipboard / Strategy", icon: CheckSquare },
  { id: "design", label: "Palette / Design", icon: Palette },
  { id: "code", label: "Code / Engineering", icon: Code2 },
  { id: "launch", label: "Rocket / Launch", icon: Rocket },
  { id: "compass", label: "Compass / Roadmap", icon: Compass },
  { id: "sparkles", label: "Sparkles / Polish", icon: Sparkles },
  { id: "branch", label: "Workflow / Pipeline", icon: GitBranch },
];

export default function ProcessForm({
  initialData,
  isEdit = false,
  stepId,
}: ProcessFormProps) {
  const router = useRouter();

  const [stepNumber, setStepNumber] = useState(initialData?.stepNumber || "01");
  const [title, setTitle] = useState(initialData?.title || "");
  const [shortTitle, setShortTitle] = useState(initialData?.shortTitle || "");
  const [badge, setBadge] = useState(initialData?.badge || "WORKFLOW");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [icon, setIcon] = useState(initialData?.icon || "search");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  
  // Deliverables list
  const [deliverables, setDeliverables] = useState<string[]>(() => {
    if (!initialData?.deliverables) return [];
    try {
      return JSON.parse(initialData.deliverables);
    } catch {
      return [];
    }
  });
  const [deliverableInput, setDeliverableInput] = useState("");

  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(
    initialData?.isPublished !== undefined ? Boolean(initialData.isPublished) : true
  );

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState(false);

  const addDeliverable = () => {
    if (!deliverableInput.trim()) return;
    if (!deliverables.includes(deliverableInput.trim())) {
      setDeliverables([...deliverables, deliverableInput.trim()]);
    }
    setDeliverableInput("");
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "process");

    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok && data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error || "Failed to upload image to Cloudflare R2.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to upload API");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!stepNumber.trim()) {
      setError("Please provide a step index (e.g. 01, 02).");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a stage title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter the full stage description.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        stepNumber: stepNumber.trim(),
        title: title.trim(),
        shortTitle: shortTitle.trim() || title.trim(),
        badge: badge.trim() || "WORKFLOW",
        shortDescription: shortDescription.trim() || null,
        description: description.trim(),
        icon: icon.trim(),
        imageUrl: imageUrl.trim() || null,
        deliverables,
        displayOrder: Number(displayOrder) || 0,
        isPublished,
      };

      const url = isEdit && stepId ? `/api/admin/process/${stepId}` : "/api/admin/process";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save process step.");
      }

      setSuccessNotice(true);
      setTimeout(() => {
        router.push("/admin/process");
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong saving the process step.");
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
            href="/admin/process"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all"
            aria-label="Back to process steps"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#16C7FF]">
                {isEdit ? "Edit Stage" : "New Stage"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              {isEdit ? `Edit: [${initialData?.stepNumber || "01"}] ${initialData?.title || "Process Step"}` : "Create Workflow Stage"}
            </h1>
          </div>
        </div>

        {initialData?.stepNumber && (
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#16C7FF]/10 text-[#16C7FF] text-xs font-mono font-bold border border-[#16C7FF]/20">
            Stage {initialData.stepNumber}
          </span>
        )}
      </div>

      {/* Error & Success Banners */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Workflow stage saved successfully! Returning to list...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 md:p-8 rounded-3xl bg-[#090C12] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 size-72 bg-[#16C7FF]/5 blur-[90px] rounded-full pointer-events-none" />

          {/* Row 1: Step Number, Badge, Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                Step Index *
              </label>
              <input
                type="text"
                required
                value={stepNumber}
                onChange={(e) => setStepNumber(e.target.value)}
                placeholder="e.g. 01, 02, 03"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 font-mono font-bold focus:outline-none focus:border-[#16C7FF]/50 transition-all"
              />
              <p className="text-[11px] text-white/40">Numbered badge (e.g. &ldquo;01&rdquo;).</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                Phase Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. RESEARCH & COMPASS"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 uppercase tracking-wider focus:outline-none focus:border-[#16C7FF]/50 transition-all"
              />
              <p className="text-[11px] text-white/40">Pill tag shown above the heading.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#16C7FF]/50 transition-all"
              />
              <p className="text-[11px] text-white/40">Sequential ordering (1, 2, 3...).</p>
            </div>
          </div>

          {/* Row 2: Full Title & Short Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                Full Stage Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!shortTitle) setShortTitle(e.target.value);
                }}
                placeholder="e.g. Discovery & Audits"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50 transition-all"
              />
              <p className="text-[11px] text-white/40">Used on the dedicated /process page.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                Short Title (Homepage Node)
              </label>
              <input
                type="text"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                placeholder="e.g. Discover"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50 transition-all"
              />
              <p className="text-[11px] text-white/40">Concise 1-word label for timeline nodes.</p>
            </div>
          </div>

          {/* Short Description (Homepage Node) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70">
              Short Description (Homepage Node)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. We learn about your business, audience, and goals."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50 transition-all"
            />
            <p className="text-[11px] text-white/40">Compact summary displayed below node icons on the home page.</p>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70">
              Full Stage Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what BrandHive Studio undertakes during this phase..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50 transition-all resize-none"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70">
              Stage Icon Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ICON_PRESETS.map((preset) => {
                const isSelected = icon.toLowerCase() === preset.id;
                const PresetIcon = preset.icon;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setIcon(preset.id)}
                    className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#16C7FF]/15 text-[#16C7FF] border-[#16C7FF]/40 shadow-[0_0_15px_rgba(22,199,255,0.15)]"
                        : "bg-white/[0.02] hover:bg-white/[0.05] text-white/60 hover:text-white border-white/5"
                    }`}
                  >
                    <PresetIcon className="size-4 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage Image & Cloudflare R2 Upload */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center justify-between">
              <span>Stage Illustration Image</span>
              <span className="text-[10px] text-white/40 normal-case">Cloudflare R2 or WebP path</span>
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/process/discovery/process-discovery-workshop.webp"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50 font-mono"
              />

              <label className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 cursor-pointer transition-all">
                {uploadingImage ? (
                  <Loader2 className="size-3.5 animate-spin text-[#16C7FF]" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                <span>{uploadingImage ? "Uploading to R2..." : "Upload R2"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {imageUrl && (
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <Image
                  src={imageUrl}
                  alt="Stage Illustration Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Deliverables / Bullets Builder */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70">
              Deliverables &amp; Bullet Points
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={deliverableInput}
                onChange={(e) => setDeliverableInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDeliverable();
                  }
                }}
                placeholder="e.g. Competitor Visual Audits, Wireframe Architecture"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#16C7FF]/50"
              />
              <button
                type="button"
                onClick={addDeliverable}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Bullet</span>
              </button>
            </div>

            {deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {deliverables.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/80"
                  >
                    <span className="size-1.5 rounded-full bg-[#16C7FF]" />
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status Toggle */}
          <div className="pt-2 border-t border-white/5">
            <div
              onClick={() => setIsPublished(!isPublished)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                isPublished
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.04]"
              }`}
            >
              <div>
                <span className="text-xs font-bold block">
                  {isPublished ? "Stage Published" : "Stage Draft (Hidden)"}
                </span>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {isPublished
                    ? "Visible on both homepage process timeline and the /process stage walkthrough."
                    : "Hidden from public website visitors until published."}
                </p>
              </div>

              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${
                  isPublished ? "bg-emerald-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`size-4 rounded-full bg-white transition-transform ${
                    isPublished ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/process"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold shadow-[0_0_20px_rgba(22,199,255,0.25)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{loading ? "Saving..." : isEdit ? "Update Stage" : "Create Stage"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
