"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Search,
  Grid,
  List as ListIcon,
  Trash2,
  Copy,
  Check,
  HardDrive,
  RefreshCw,
  X,
  AlertTriangle,
  Folder,
  Layers,
  ExternalLink,
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  publicUrl: string;
  altText: string | null;
  createdAt: string;
  category: string;
  isUsed: boolean;
  usedBy: Array<{ id: string; title: string; type: string }>;
}

interface StorageStats {
  totalObjects: number;
  usedBytes: number;
  usedFormatted: string;
  totalBytes: number;
  totalFormatted: string;
  availableBytes: number;
  availableFormatted: string;
  usagePercent: number;
}

const CATEGORIES = [
  { id: "all", label: "All Media" },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "testimonials", label: "Testimonials" },
  { id: "content", label: "Site Content" },
  { id: "general", label: "General" },
];

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [usageFilter, setUsageFilter] = useState<"all" | "used" | "unused">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selected media for detail drawer
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Upload modal / state
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("projects");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok && Array.isArray(data.media)) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error("Failed to load media list:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/admin/media/stats");
      const data = await res.json();
      if (data.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load storage stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
    fetchStats();
  }, [fetchMedia, fetchStats]);

  // Copy public URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    let uploadedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);

      try {
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.ok) {
          uploadedCount++;
        } else {
          errors.push(`${file.name}: ${data.error || "Upload failed"}`);
        }
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "Network error"}`);
      }
    }

    setUploading(false);
    e.target.value = "";

    if (errors.length > 0) {
      setUploadError(errors.join(" | "));
    }
    if (uploadedCount > 0) {
      setUploadSuccess(`Successfully uploaded ${uploadedCount} file${uploadedCount > 1 ? "s" : ""}.`);
      fetchMedia();
      fetchStats();
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const url = `/api/admin/media/${deleteItem.id}${forceDelete ? "?force=true" : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();

      if (data.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== deleteItem.id));
        if (activeItem?.id === deleteItem.id) {
          setActiveItem(null);
        }
        setDeleteItem(null);
        setForceDelete(false);
        fetchStats();
      } else {
        setDeleteError(data.error || "Failed to delete media");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Network error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Media
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = item.filename.toLowerCase().includes(q);
        const matchKey = item.storageKey.toLowerCase().includes(q);
        const matchAlt = item.altText?.toLowerCase().includes(q);
        if (!matchName && !matchKey && !matchAlt) return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (item.category !== selectedCategory) return false;
      }

      // Usage filter
      if (usageFilter === "used" && !item.isUsed) return false;
      if (usageFilter === "unused" && item.isUsed) return false;

      return true;
    });
  }, [mediaList, searchQuery, selectedCategory, usageFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Cloudflare R2 storage management and asset browser.
          </p>
        </div>

        {/* Quick Upload Button */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs sm:text-sm hover:bg-[#16C7FF]/90 transition-all shadow-lg shadow-[#16C7FF]/20 active:scale-95">
            <Upload className="size-4" />
            <span>{uploading ? "Uploading..." : "Upload Media"}</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Storage Usage Card */}
      <div className="p-6 rounded-3xl bg-[#090C12] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#16C7FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF] shrink-0">
              <HardDrive className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Cloudflare R2 Storage</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Bucket: <span className="font-mono text-white/70">brandhive-studio-media</span>
              </p>
            </div>
          </div>

          {/* Progress / Stats Numbers */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center justify-between text-xs text-white/70 mb-2">
              <div className="flex items-center gap-4">
                <span>
                  Used: <strong className="text-white">{stats?.usedFormatted || "0 B"}</strong>
                </span>
                <span>
                  Available: <strong className="text-white">{stats?.availableFormatted || "10 GB"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#16C7FF]">{stats?.usagePercent ?? 0}%</span>
                <button
                  type="button"
                  onClick={() => {
                    fetchStats();
                    fetchMedia();
                  }}
                  disabled={statsLoading}
                  className="p-1 rounded-md text-white/40 hover:text-white transition-colors"
                  title="Refresh storage statistics"
                >
                  <RefreshCw className={`size-3.5 ${statsLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#16C7FF] to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats?.usagePercent ?? 0, 1)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/40 mt-2">
              <span>Total Capacity: {stats?.totalFormatted || "10 GB"}</span>
              <span>Total Assets: {stats?.totalObjects || mediaList.length}</span>
            </div>
          </div>
        </div>

        {/* Upload feedback banner */}
        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
            <span>{uploadSuccess}</span>
            <button type="button" onClick={() => setUploadSuccess(null)} className="text-emerald-400 hover:text-white">
              <X className="size-3.5" />
            </button>
          </div>
        )}
        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{uploadError}</span>
            <button type="button" onClick={() => setUploadError(null)} className="text-rose-400 hover:text-white">
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#16C7FF] text-black shadow-md shadow-[#16C7FF]/20"
                    : "bg-[#090C12] text-white/60 hover:text-white border border-white/5 hover:border-white/15"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Mode & Usage Filter */}
          <div className="flex items-center gap-3">
            {/* Target Folder Selector for Next Uploads */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090C12] border border-white/10 text-xs">
              <Folder className="size-3.5 text-[#16C7FF]" />
              <span className="text-white/40 text-[11px]">Upload to:</span>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                aria-label="Upload destination category folder"
                className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="projects" className="bg-[#090C12] text-white">projects/</option>
                <option value="services" className="bg-[#090C12] text-white">services/</option>
                <option value="testimonials" className="bg-[#090C12] text-white">testimonials/</option>
                <option value="content" className="bg-[#090C12] text-white">content/</option>
                <option value="general" className="bg-[#090C12] text-white">general/</option>
              </select>
            </div>

            {/* Usage Filter */}
            <div className="flex items-center rounded-xl bg-[#090C12] border border-white/10 p-1 text-xs">
              <button
                type="button"
                onClick={() => setUsageFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  usageFilter === "all" ? "bg-white/10 text-white font-semibold" : "text-white/40 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setUsageFilter("used")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  usageFilter === "used" ? "bg-[#16C7FF]/20 text-[#16C7FF] font-semibold" : "text-white/40 hover:text-white"
                }`}
              >
                In Use
              </button>
              <button
                type="button"
                onClick={() => setUsageFilter("unused")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  usageFilter === "unused" ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-white/40 hover:text-white"
                }`}
              >
                Unused
              </button>
            </div>

            {/* Grid / List Toggle */}
            <div className="flex items-center rounded-xl bg-[#090C12] border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                }`}
              >
                <Grid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                }`}
              >
                <ListIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by filename, path, or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090C12] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF]/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <RefreshCw className="size-8 text-[#16C7FF] animate-spin mb-4" />
          <p className="text-sm font-medium text-white/70">Connecting to Cloudflare R2 and Turso DB...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <Upload className="size-7" />
          </div>
          <h3 className="text-base font-bold text-white">No media files found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 mb-6">
            {searchQuery || selectedCategory !== "all" || usageFilter !== "all"
              ? "No assets match your current filters. Try changing or clearing your search."
              : "Your Cloudflare R2 storage bucket currently has no recorded assets. Upload images to start."}
          </p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs hover:bg-[#16C7FF]/90 transition-all shadow-md shadow-[#16C7FF]/20">
            <Upload className="size-4" />
            <span>Upload Your First Asset</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/avif"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className={`group relative rounded-2xl bg-[#090C12] border transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-xl hover:border-[#16C7FF]/40 ${
                activeItem?.id === item.id ? "border-[#16C7FF] ring-2 ring-[#16C7FF]/20" : "border-white/10"
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square w-full bg-[#050608] overflow-hidden">
                <Image
                  src={item.publicUrl}
                  alt={item.altText || item.filename}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* In Use Tag */}
                {item.isUsed ? (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/80 text-white backdrop-blur-md shadow-sm">
                    In Use ({item.usedBy.length})
                  </span>
                ) : (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white/60 backdrop-blur-md">
                    Unused
                  </span>
                )}

                {/* Category Pill */}
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-white/70 backdrop-blur-md">
                  {item.category}
                </span>

                {/* Quick actions overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.publicUrl);
                    }}
                    title="Copy Public URL"
                    className="p-2 rounded-xl bg-white/20 hover:bg-[#16C7FF] hover:text-black text-white transition-colors"
                  >
                    <Copy className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteItem(item);
                    }}
                    title="Delete Media"
                    className="p-2 rounded-xl bg-white/20 hover:bg-rose-500 text-white transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Meta Info */}
              <div className="p-3 flex flex-col flex-1 justify-between bg-[#090C12]">
                <p className="text-xs font-semibold text-white truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-[11px] text-white/40 mt-1">
                  <span>{formatBytes(item.sizeBytes)}</span>
                  <span className="uppercase font-mono text-[9px]">
                    {item.mimeType.replace("image/", "")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl bg-[#090C12] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMedia.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="py-2 px-4">
                      <div className="relative size-10 rounded-lg overflow-hidden bg-black/40 border border-white/10">
                        <Image
                          src={item.publicUrl}
                          alt={item.filename}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white max-w-[200px] truncate">
                      {item.filename}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-white/60">
                      {item.category}/
                    </td>
                    <td className="py-3 px-4">{formatBytes(item.sizeBytes)}</td>
                    <td className="py-3 px-4 uppercase font-mono text-[10px]">
                      {item.mimeType.replace("image/", "")}
                    </td>
                    <td className="py-3 px-4">
                      {item.isUsed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Used ({item.usedBy.length})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/40 border border-white/10">
                          Unused
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.publicUrl)}
                          title="Copy Public URL"
                          className="p-1.5 rounded-lg text-white/50 hover:text-[#16C7FF] hover:bg-white/5 transition-colors"
                        >
                          <Copy className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteItem(item)}
                          title="Delete Media"
                          className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0C1017] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-[#16C7FF]">
                <Layers className="size-4" />
                <span>Asset Inspector</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Preview image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 mb-6 flex items-center justify-center">
              <Image
                src={activeItem.publicUrl}
                alt={activeItem.filename}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#080B10] border border-white/5 mb-6 text-xs">
              <div>
                <span className="text-[10px] text-white/40 uppercase font-mono">File Size</span>
                <p className="font-semibold text-white mt-0.5">{formatBytes(activeItem.sizeBytes)}</p>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-mono">Format</span>
                <p className="font-semibold text-white mt-0.5 uppercase">{activeItem.mimeType.replace("image/", "")}</p>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-mono">Category</span>
                <p className="font-semibold text-[#16C7FF] mt-0.5">{activeItem.category}</p>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase font-mono">Uploaded</span>
                <p className="font-semibold text-white mt-0.5">
                  {new Date(activeItem.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Storage Key & Public URL copy */}
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-[11px] text-white/50 block mb-1 font-mono">R2 Storage Key:</span>
                <p className="text-xs font-mono text-white/80 bg-black/40 p-2.5 rounded-xl border border-white/5 break-all">
                  {activeItem.storageKey}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-white/50 block mb-1 font-mono">Public Asset URL:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeItem.publicUrl}
                    className="flex-1 text-xs font-mono text-white/80 bg-black/40 p-2.5 rounded-xl border border-white/5 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(activeItem.publicUrl)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#16C7FF] hover:text-black text-white text-xs font-semibold transition-all whitespace-nowrap"
                  >
                    {copiedUrl ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copiedUrl ? "Copied!" : "Copy"}</span>
                  </button>
                  <a
                    href={activeItem.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Usage references */}
            <div className="mb-6 p-4 rounded-2xl bg-[#080B10] border border-white/5">
              <span className="text-xs font-bold text-white block mb-2">Usage in Website:</span>
              {activeItem.isUsed ? (
                <ul className="space-y-2">
                  {activeItem.usedBy.map((ref, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="font-semibold text-white">{ref.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#16C7FF]/10 text-[#16C7FF] border border-[#16C7FF]/20">
                        {ref.type}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/40">
                  This asset is currently not linked to any active portfolio project. It is safe to remove if unneeded.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setDeleteItem(activeItem);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Asset</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0C1017] border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Media Asset</h3>
                <p className="text-xs text-white/50">This operation deletes the file from R2 and Turso.</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-mono">{deleteItem.filename}</strong>?
            </p>

            {/* Warning if actively referenced */}
            {deleteItem.isUsed && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2 mb-4">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                  Warning: Asset is actively in use!
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  This image is referenced by {deleteItem.usedBy.length} website item(s). Deleting it will result in broken images on published pages.
                </p>
                <label className="flex items-center gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-[#16C7FF] focus:ring-0 size-4"
                  />
                  <span className="text-[11px] font-semibold text-white">
                    I understand the risk and want to force delete
                  </span>
                </label>
              </div>
            )}

            {deleteError && (
              <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-4">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteItem(null);
                  setForceDelete(false);
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || (deleteItem.isUsed && !forceDelete)}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors shadow-lg shadow-rose-500/20"
              >
                {deleting ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>{deleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
