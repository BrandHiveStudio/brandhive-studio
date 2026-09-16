"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Sparkles,
  Eye,
} from "lucide-react";
import type { Post } from "@/lib/db/schema";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Deletion modal state
  const [deleteItem, setDeleteItem] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase())) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && p.isPublished) ||
        (statusFilter === "draft" && !p.isPublished);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, search, selectedCategory, statusFilter]);

  // Quick toggle publish/draft
  const handleTogglePublish = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}/publish`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isPublished: data.post.isPublished } : item))
        );
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Safe delete
  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/posts/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((item) => item.id !== deleteItem.id));
        setDeleteItem(null);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#16C7FF]/10 flex items-center justify-center text-[#16C7FF]">
              <FileText className="size-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#16C7FF]">
              Insights CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Articles &amp; Perspectives
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-xl">
            Create, edit, publish, and manage agency articles, design perspectives, and leadership guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPosts()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
            title="Refresh articles"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#16C7FF]" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold shadow-[0_0_18px_rgba(22,199,255,0.25)] transition-all"
          >
            <Plus className="size-4" />
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_12px_rgba(22,199,255,0.1)]"
                : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5"
            }`}
          >
            All Categories ({posts.length})
          </button>
          {categories.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_12px_rgba(22,199,255,0.1)]"
                    : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5"
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] text-white/40">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right side: Status Filter & Search */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
            className="bg-[#0d1218]/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#16C7FF]/40 cursor-pointer"
          >
            <option value="all" className="bg-[#0c1017]">All Statuses</option>
            <option value="published" className="bg-[#0c1017]">Published Only</option>
            <option value="draft" className="bg-[#0c1017]">Drafts Only</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1218]/90 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#16C7FF]/40 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Content: Table / Cards */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-[#0d1218]/50 rounded-2xl border border-white/5">
          <div className="size-7 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
          <p className="text-xs text-white/40">Loading articles from Turso...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-16 text-center bg-[#0d1218]/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30">
            <FileText className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-white/80">No articles found</h3>
          <p className="text-xs text-white/40 max-w-sm">
            {search
              ? "No articles matched your search query."
              : selectedCategory !== "all"
              ? `There are no articles under the '${selectedCategory}' category.`
              : "Get started by adding your first article."}
          </p>
          <Link
            href="/admin/posts/new"
            className="mt-2 px-4 py-2 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>Create Article</span>
          </Link>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-[#0d1218]/70 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-20">Cover</th>
                  <th className="py-3.5 px-4">Title &amp; Excerpt</th>
                  <th className="py-3.5 px-4 w-36">Category</th>
                  <th className="py-3.5 px-4 w-32">Status</th>
                  <th className="py-3.5 px-4 w-28">Featured</th>
                  <th className="py-3.5 px-5 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredPosts.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Cover Thumbnail */}
                    <td className="py-3.5 px-5">
                      <div className="size-12 rounded-xl bg-neutral-900 border border-white/10 relative overflow-hidden shrink-0">
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-white/20">
                            <FileText className="size-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Excerpt */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-semibold text-white text-sm mb-1 group-hover:text-[#16C7FF] transition-colors line-clamp-1">
                        {item.title}
                      </div>
                      <p className="text-white/50 text-xs line-clamp-1 font-normal">
                        {item.excerpt || "No excerpt provided"}
                      </p>
                      <span className="text-[10px] text-white/30 font-mono mt-0.5 block">
                        /insights/{item.slug}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-white/80 border border-white/10">
                        {item.category}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(item.id)}
                        disabled={togglingId === item.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          item.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {togglingId === item.id ? (
                          <div className="size-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span
                            className={`size-1.5 rounded-full ${
                              item.isPublished ? "bg-emerald-400 animate-pulse" : "bg-white/40"
                            }`}
                          />
                        )}
                        <span>{item.isPublished ? "Published" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="py-3.5 px-4">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16C7FF]">
                          <Sparkles className="size-3" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/insights/${item.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-white/40 hover:text-[#16C7FF] hover:bg-[#16C7FF]/10 transition-colors"
                          title="Preview public article"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <Link
                          href={`/admin/posts/${item.id}`}
                          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit article"
                        >
                          <Edit2 className="size-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS */}
          <div className="md:hidden space-y-4">
            {filteredPosts.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-white/10 bg-[#0d1218]/90 backdrop-blur-md shadow-lg space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="size-16 rounded-xl bg-neutral-900 border border-white/10 relative overflow-hidden shrink-0">
                    {item.coverImage ? (
                      <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-white/20">
                        <FileText className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/70 border border-white/10">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="text-[10px] text-[#16C7FF] font-bold flex items-center gap-1">
                          <Sparkles className="size-2.5" /> Featured
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {item.excerpt && (
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{item.excerpt}</p>
                )}

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePublish(item.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border ${
                      item.isPublished
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${item.isPublished ? "bg-emerald-400" : "bg-white/40"}`} />
                    <span>{item.isPublished ? "Published" : "Draft"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/insights/${item.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10"
                    >
                      <Eye className="size-3.5 text-[#16C7FF]" />
                    </Link>
                    <Link
                      href={`/admin/posts/${item.id}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10"
                    >
                      <Edit2 className="size-3.5 text-white" />
                    </Link>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/5"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 4. Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[#0c1017] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Trash2 className="size-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Article?</h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Are you sure you want to permanently delete:
                <br />
                <span className="text-white font-semibold mt-1 block">&ldquo;{deleteItem.title}&rdquo;</span>
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
