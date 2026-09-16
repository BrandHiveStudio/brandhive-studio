"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Inbox,
  Search,
  Mail,
  Phone,
  Building,
  Trash2,
  X,
  Sparkles,
  Save,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import type { ContactInquiry } from "@/lib/db/schema";

interface InquiriesResponse {
  ok: boolean;
  inquiries: ContactInquiry[];
  counts: Record<string, number>;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  new: {
    label: "New",
    bg: "bg-[#16C7FF]/10",
    text: "text-[#16C7FF]",
    border: "border-[#16C7FF]/30",
    dot: "bg-[#16C7FF]",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  converted: {
    label: "Converted",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Closed",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
  spam: {
    label: "Spam",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
  },
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    all: 0,
    new: 0,
    contacted: 0,
    in_progress: 0,
    converted: 0,
    closed: 0,
    spam: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals & Drawers
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  // Deletion modal
  const [deleteItem, setDeleteItem] = useState<ContactInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch inquiries from API
  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (res.ok) {
        const data: InquiriesResponse = await res.json();
        setInquiries(data.inquiries || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, search]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // When opening an inquiry detail
  const handleOpenDetail = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setNotesInput(inquiry.notes || "");
    setNotesSavedNotice(false);
  };

  // Quick status update
  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === inquiryId ? { ...item, status: newStatus } : item
          )
        );

        if (selectedInquiry && selectedInquiry.id === inquiryId) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }

        // Refresh counts aggregate
        const countRes = await fetch("/api/admin/inquiries");
        if (countRes.ok) {
          const cData: InquiriesResponse = await countRes.json();
          if (cData.counts) setCounts(cData.counts);
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Save internal notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    setNotesSavedNotice(false);

    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesInput }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === selectedInquiry.id ? { ...item, notes: notesInput } : item
          )
        );
        setSelectedInquiry((prev) => (prev ? { ...prev, notes: notesInput } : null));
        setNotesSavedNotice(true);
        setTimeout(() => setNotesSavedNotice(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/inquiries/${deleteItem.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== deleteItem.id));
        if (selectedInquiry && selectedInquiry.id === deleteItem.id) {
          setSelectedInquiry(null);
        }
        setDeleteItem(null);
        // Refresh counts
        const countRes = await fetch("/api/admin/inquiries");
        if (countRes.ok) {
          const cData: InquiriesResponse = await countRes.json();
          if (cData.counts) setCounts(cData.counts);
        }
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date safely
  const formatDate = (dateVal: Date | number | null | undefined) => {
    if (!dateVal) return "Recently";
    try {
      const d = typeof dateVal === "number" ? new Date(dateVal * 1000) : new Date(dateVal);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#16C7FF]/10 flex items-center justify-center text-[#16C7FF]">
              <Inbox className="size-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#16C7FF]">
              Client Inquiries
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Inquiries &amp; Leads
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-xl">
            Track, manage, and convert incoming client inquiries submitted via the BrandHive Studio website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInquiries()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#16C7FF]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "new", label: "New", count: counts.new, highlight: true },
            { id: "contacted", label: "Contacted", count: counts.contacted },
            { id: "in_progress", label: "In Progress", count: counts.in_progress },
            { id: "converted", label: "Converted", count: counts.converted },
            { id: "closed", label: "Closed", count: counts.closed },
            { id: "spam", label: "Spam", count: counts.spam },
          ].map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_15px_rgba(22,199,255,0.15)]"
                    : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      tab.highlight && tab.count > 0
                        ? "bg-[#16C7FF] text-[#050608]"
                        : isActive
                        ? "bg-[#16C7FF]/20 text-[#16C7FF]"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px] sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1218]/90 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all"
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

      {/* 3. Main Content: Table & Cards */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-[#0d1218]/50 rounded-2xl border border-white/5">
          <div className="size-7 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
          <p className="text-xs text-white/40">Loading inquiries from Turso...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="p-16 text-center bg-[#0d1218]/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30">
            <Inbox className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-white/80">No inquiries found</h3>
          <p className="text-xs text-white/40 max-w-sm">
            {search
              ? "No inquiries matched your search criteria. Try modifying your keywords."
              : selectedStatus !== "all"
              ? `There are currently no inquiries in '${statusConfig[selectedStatus]?.label || selectedStatus}' status.`
              : "Submissions through the public Contact form will appear here in real-time."}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-[#0d1218]/70 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Client / Lead</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Service &amp; Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {inquiries.map((item) => {
                  const cfg = statusConfig[item.status] || statusConfig.new;
                  const isNew = item.status === "new";

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className={`hover:bg-white/[0.03] transition-colors cursor-pointer group ${
                        isNew ? "bg-[#16C7FF]/[0.02]" : ""
                      }`}
                    >
                      {/* Name & Company */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="size-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center font-bold text-white/80 text-xs shrink-0">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            {isNew && (
                              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#16C7FF] ring-2 ring-[#0d1218] animate-pulse" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{item.name}</span>
                              {isNew && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#16C7FF]/20 text-[#16C7FF] border border-[#16C7FF]/30 uppercase">
                                  NEW
                                </span>
                              )}
                            </div>
                            {item.company ? (
                              <div className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
                                <Building className="size-3 text-white/30" />
                                <span>{item.company}</span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-white/30 italic mt-0.5">Individual</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact: Email & Phone */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          <a
                            href={`mailto:${item.email}`}
                            className="text-white/80 hover:text-[#16C7FF] flex items-center gap-1.5 truncate max-w-[190px] transition-colors"
                          >
                            <Mail className="size-3 text-white/30 shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </a>
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="text-[11px] text-white/50 hover:text-[#16C7FF] flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="size-3 text-white/30 shrink-0" />
                              <span>{item.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Service & Budget */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-white/90 truncate max-w-[180px]">
                            {item.service || "General Inquiry"}
                          </span>
                          {item.budget && (
                            <span className="text-[11px] text-emerald-400/80 font-mono">
                              {item.budget}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer transition-all bg-[#0a0e14] ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <option value="new" className="bg-[#0e141c] text-white">New</option>
                          <option value="contacted" className="bg-[#0e141c] text-white">Contacted</option>
                          <option value="in_progress" className="bg-[#0e141c] text-white">In Progress</option>
                          <option value="converted" className="bg-[#0e141c] text-white">Converted</option>
                          <option value="closed" className="bg-[#0e141c] text-white">Closed</option>
                          <option value="spam" className="bg-[#0e141c] text-white">Spam</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-white/50 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#16C7FF]/20 text-white/70 hover:text-[#16C7FF] transition-all text-xs font-medium"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete inquiry"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS VIEW */}
          <div className="md:hidden space-y-4">
            {inquiries.map((item) => {
              const cfg = statusConfig[item.status] || statusConfig.new;
              const isNew = item.status === "new";

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className={`p-5 rounded-2xl border bg-[#0d1218]/90 backdrop-blur-md shadow-lg transition-all active:scale-[0.99] ${
                    isNew ? "border-[#16C7FF]/30 bg-[#16C7FF]/[0.02]" : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center font-bold text-white text-sm shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{item.name}</span>
                          {isNew && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#16C7FF]/20 text-[#16C7FF] border border-[#16C7FF]/30 uppercase">
                              NEW
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-white/50">{item.company || "Individual"}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-white/60">
                      <span>Service:</span>
                      <span className="font-semibold text-white/90">{item.service || "General"}</span>
                    </div>

                    <div className="flex items-center justify-between text-white/60">
                      <span>Date:</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    {item.message && (
                      <p className="text-white/60 line-clamp-2 mt-2 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        {item.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`mailto:${item.email}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <Mail className="size-3.5 text-[#16C7FF]" />
                      <span>Email</span>
                    </a>
                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#16C7FF]/15 hover:bg-[#16C7FF]/25 text-[#16C7FF] text-xs font-semibold text-center border border-[#16C7FF]/30"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/5"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 4. DETAIL SLIDEOVER / MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c1017] border border-white/15 rounded-3xl shadow-2xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 sticky top-0 bg-[#0c1017]/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-[#16C7FF]/20 to-blue-600/20 border border-[#16C7FF]/30 flex items-center justify-center text-[#16C7FF] font-bold text-lg">
                  {selectedInquiry.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                    <span>{selectedInquiry.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        statusConfig[selectedInquiry.status]?.bg
                      } ${statusConfig[selectedInquiry.status]?.text} ${
                        statusConfig[selectedInquiry.status]?.border
                      }`}
                    >
                      {statusConfig[selectedInquiry.status]?.label || selectedInquiry.status}
                    </span>
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    {selectedInquiry.company || "Individual Inquiry"} • Submitted on{" "}
                    {formatDate(selectedInquiry.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Quick Contact & Service Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-[#16C7FF] shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-xs font-semibold text-white/90 hover:text-[#16C7FF] truncate block transition-colors"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-[#16C7FF] shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">
                      Phone Number
                    </span>
                    {selectedInquiry.phone ? (
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="text-xs font-semibold text-white/90 hover:text-[#16C7FF] truncate block transition-colors"
                      >
                        {selectedInquiry.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-white/30 italic">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-[#16C7FF] shrink-0">
                    <Briefcase className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">
                      Requested Service
                    </span>
                    <span className="text-xs font-semibold text-white/90 truncate block">
                      {selectedInquiry.service || "General Inquiry"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 shrink-0">
                    <DollarSign className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">
                      Stated Budget
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono truncate block">
                      {selectedInquiry.budget || "Not Specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Box */}
              <div>
                <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider block mb-2">
                  Client Project Description
                </label>
                <div className="p-4 rounded-2xl bg-[#070a0f] border border-white/10 text-white/90 text-sm leading-relaxed whitespace-pre-wrap selection:bg-[#16C7FF]/30">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Controller */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="size-3.5 text-[#16C7FF]" />
                    <span>Inquiry Pipeline Stage</span>
                  </label>
                  <span className="text-[11px] text-white/40">Auto-saves on select</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["new", "contacted", "in_progress", "converted", "closed", "spam"].map((st) => {
                    const active = selectedInquiry.status === st;
                    const c = statusConfig[st];
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedInquiry.id, st)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          active
                            ? `${c.bg} ${c.text} ${c.border} shadow-[0_0_12px_rgba(22,199,255,0.15)] ring-1 ring-[#16C7FF]/40`
                            : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Internal Notes (Admin-only) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="inquiry-notes" className="text-xs font-bold text-white flex items-center gap-2">
                    <AlertCircle className="size-3.5 text-[#16C7FF]" />
                    <span>Internal Agency Notes</span>
                    <span className="text-[10px] font-normal text-white/40">(Never shown publicly)</span>
                  </label>
                  {notesSavedNotice && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="size-3.5" />
                      Notes saved!
                    </span>
                  )}
                </div>
                <textarea
                  id="inquiry-notes"
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Add private staff notes, proposal terms, discovery call takeaways, or follow-up schedules..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#070a0f] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(22,199,255,0.2)]"
                  >
                    {savingNotes ? (
                      <div className="size-3.5 border-2 border-[#050608]/30 border-t-[#050608] rounded-full animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    <span>Save Internal Notes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-[#0c1017]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  setDeleteItem(selectedInquiry);
                }}
                className="text-xs text-red-400/80 hover:text-red-400 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>Delete this inquiry</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding%20your%20inquiry%20with%20BrandHive%20Studio`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all"
                >
                  <Mail className="size-3.5 text-[#16C7FF]" />
                  <span>Reply via Email</span>
                </a>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
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
              <h3 className="text-lg font-bold text-white">Delete Inquiry?</h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Are you sure you want to permanently delete the inquiry from{" "}
                <span className="text-white font-semibold">{deleteItem.name}</span> ({deleteItem.email})?
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
