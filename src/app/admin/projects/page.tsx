"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderKanban,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface AdminProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverImage?: string;
  logoImage?: string;
  client?: string;
  isFeatured: boolean;
  isOngoing: boolean;
  isPublished: boolean;
  displayOrder: number;
  imageCount: number;
  updatedAt: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<AdminProjectItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleTogglePublish = async (project: AdminProjectItem) => {
    setTogglingId(project.id);
    const newStatus = !project.isPublished;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newStatus }),
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, isPublished: newStatus } : p))
        );
      }
    } catch (err) {
      console.error("Error toggling publish state:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/projects/${projectToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
        setDeleteModalOpen(false);
        setProjectToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Get distinct categories for filter
  const categories = Array.from(new Set(projects.map((p) => p.category))).filter(Boolean);

  // Filtered projects
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && p.isPublished) ||
      (statusFilter === "draft" && !p.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const publishedCount = projects.filter((p) => p.isPublished).length;
  const draftCount = projects.filter((p) => !p.isPublished).length;
  const featuredCount = projects.filter((p) => p.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Portfolio Projects</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#16C7FF]/10 text-[#16C7FF] text-xs font-semibold">
              {projects.length} Total
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Create, edit, publish, and order portfolio case studies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin text-[#16C7FF]" : ""}`} />
          </button>

          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16C7FF] to-[#0D85FF] text-black font-semibold text-xs hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(22,199,255,0.3)]"
          >
            <Plus className="size-4" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/10">
          <div className="text-[10px] uppercase font-mono text-white/40">Total Case Studies</div>
          <div className="text-2xl font-bold text-white mt-1">{projects.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/10">
          <div className="text-[10px] uppercase font-mono text-emerald-400">Published</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{publishedCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/10">
          <div className="text-[10px] uppercase font-mono text-amber-400">Drafts</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{draftCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#090C12] border border-white/10">
          <div className="text-[10px] uppercase font-mono text-[#16C7FF]">Featured</div>
          <div className="text-2xl font-bold text-[#16C7FF] mt-1">{featuredCount}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#090C12] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="size-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, client, slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0E131F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF] transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
            className="px-3 py-2 rounded-xl bg-[#0E131F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#16C7FF] transition-colors"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Projects View */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 text-[#16C7FF] animate-spin" />
          <span className="text-xs text-white/50">Fetching portfolio from Turso...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 text-center space-y-3">
          <FolderKanban className="size-10 text-white/30 mx-auto" />
          <h3 className="text-base font-semibold text-white">No projects found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search query or filters."
              : "No projects in the CMS yet. Click 'New Project' to create your first case study."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-3xl bg-[#090C12] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Project</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-3 text-center">Featured</th>
                    <th className="py-3.5 px-3 text-center">Order</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-white/80">
                  {filtered.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Project title and cover */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                            {project.coverImage ? (
                              <Image
                                src={project.coverImage}
                                alt={project.title}
                                fill
                                className="object-cover"
                                sizes="50px"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-white/20">
                                <FolderKanban className="size-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white group-hover:text-[#16C7FF] transition-colors truncate">
                              {project.title}
                            </div>
                            <div className="text-[11px] text-white/40 font-mono mt-0.5">
                              /portfolio/{project.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-white/60">
                        <span className="inline-block max-w-[180px] truncate">
                          {project.category}
                        </span>
                        {project.isOngoing && (
                          <div className="text-[10px] text-[#16C7FF] mt-0.5">Ongoing</div>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-3 text-center">
                        <button
                          onClick={() => handleTogglePublish(project)}
                          disabled={togglingId === project.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                            project.isPublished
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                          }`}
                        >
                          {togglingId === project.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : project.isPublished ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <XCircle className="size-3" />
                          )}
                          <span>{project.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-3 text-center">
                        {project.isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16C7FF]/10 text-[#16C7FF] border border-[#16C7FF]/20 text-[10px] font-medium">
                            <Star className="size-3 fill-current" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>

                      {/* Display Order */}
                      <td className="py-4 px-3 text-center font-mono text-white/60">
                        {project.displayOrder}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/portfolio/${project.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>

                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="p-2 rounded-lg bg-white/[0.03] hover:bg-[#16C7FF]/15 text-white/60 hover:text-[#16C7FF] transition-colors"
                            title="Edit Project"
                          >
                            <Edit2 className="size-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              setProjectToDelete(project);
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-white/[0.03] hover:bg-rose-500/15 text-white/60 hover:text-rose-400 transition-colors"
                            title="Delete Project"
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

          {/* Mobile Card View (Stacked, touch-friendly) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="p-5 rounded-2xl bg-[#090C12] border border-white/10 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="relative size-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="60px"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-white/20">
                        <FolderKanban className="size-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white text-sm truncate">{project.title}</div>
                    <div className="text-[11px] text-white/40 font-mono truncate">
                      /portfolio/{project.slug}
                    </div>
                    <div className="text-[11px] text-[#16C7FF] mt-1">{project.category}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <button
                    onClick={() => handleTogglePublish(project)}
                    disabled={togglingId === project.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                      project.isPublished
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {project.isPublished ? "Published" : "Draft"}
                  </button>

                  {project.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#16C7FF]">
                      <Star className="size-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}

                  <span className="text-[11px] text-white/40 font-mono">Order: #{project.displayOrder}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    target="_blank"
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-white/[0.04] text-xs font-medium text-white/70 hover:text-white"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-[#16C7FF]/15 text-xs font-medium text-[#16C7FF]"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setProjectToDelete(project);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0D111A] border border-white/10 shadow-2xl space-y-4">
            <div className="size-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="size-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Project</h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="text-white font-semibold">{projectToDelete.title}</span>?
                This will remove the case study and associated gallery references from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white/70 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
