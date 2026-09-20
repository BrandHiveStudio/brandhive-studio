"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Layers,
  Package,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  DollarSign,
  Tag,
  Filter,
} from "lucide-react";
import type { BrainService } from "./types";
import { SERVICE_CATEGORIES } from "./types";

interface BrainServicesTabProps {
  services: BrainService[];
  onOpenCreate: (type?: "service" | "package") => void;
  onOpenEdit: (service: BrainService) => void;
  onOpenDelete: (service: BrainService) => void;
  onToggleActive: (service: BrainService) => Promise<void> | void;
  togglingId: string | null;
}

export default function BrainServicesTab({
  services,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  togglingId,
}: BrainServicesTabProps) {
  const [search, setSearch] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState<"all" | "package" | "service">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (itemTypeFilter !== "all" && s.itemType !== itemTypeFilter) return false;
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      if (statusFilter === "active" && !s.isActive) return false;
      if (statusFilter === "inactive" && s.isActive) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.sku && s.sku.toLowerCase().includes(q))
      );
    });
  }, [services, search, itemTypeFilter, categoryFilter, statusFilter]);

  // Format pricing display
  const formatPrice = (service: BrainService) => {
    const curr = service.currency || "LKR";
    const unitStr = service.unit ? ` / ${service.unit.replace(/^per\s+/i, "")}` : "";

    if (service.pricingType === "fixed" && service.price !== null) {
      return `${curr} ${service.price.toLocaleString()}${unitStr}`;
    }
    if (service.pricingType === "starting_from" && service.startingPrice !== null) {
      return `From ${curr} ${service.startingPrice.toLocaleString()}${unitStr}`;
    }
    if (service.pricingType === "custom_quote") {
      return service.startingPrice
        ? `Quote (from ${curr} ${service.startingPrice.toLocaleString()})`
        : "Custom Quote";
    }
    if (service.price !== null) {
      return `${curr} ${service.price.toLocaleString()}${unitStr}`;
    }
    return "Custom Quote";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, slug, category, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090C12] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#16C7FF]/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenCreate("package")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <Plus className="size-3.5" />
            <span>New Package</span>
          </button>
          <button
            onClick={() => onOpenCreate("service")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs hover:bg-[#16C7FF]/90 transition-all shadow-lg shadow-[#16C7FF]/20 active:scale-95"
          >
            <Plus className="size-3.5" />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#090C12] border border-white/10 text-xs">
        {/* Item Type Pill Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          <button
            onClick={() => setItemTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              itemTypeFilter === "all"
                ? "bg-[#16C7FF] text-black font-semibold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            All Items ({services.length})
          </button>
          <button
            onClick={() => setItemTypeFilter("package")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              itemTypeFilter === "package"
                ? "bg-purple-500 text-white font-semibold shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Package className="size-3" />
            <span>Packages ({services.filter((s) => s.itemType === "package").length})</span>
          </button>
          <button
            onClick={() => setItemTypeFilter("service")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              itemTypeFilter === "service"
                ? "bg-[#16C7FF]/20 text-[#16C7FF] font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Layers className="size-3" />
            <span>Services ({services.filter((s) => s.itemType === "service").length})</span>
          </button>
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-[11px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/40 text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="px-2.5 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Content List */}
      {filteredServices.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <Layers className="size-7" />
          </div>
          <h3 className="text-base font-bold text-white">No services or packages found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 mb-6">
            {search || categoryFilter !== "all" || statusFilter !== "all" || itemTypeFilter !== "all"
              ? "Try adjusting your search terms or filter selections."
              : "No services currently stored in Turso. Create your first service or package."}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block rounded-3xl bg-[#090C12] border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Service / Package</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Authoritative Pricing</th>
                  <th className="py-3.5 px-4">Deliverables</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredServices.map((service) => {
                  const isPackage = service.itemType === "package";
                  let inclusionsCount = 0;
                  try {
                    if (service.inclusions) {
                      const arr = JSON.parse(service.inclusions);
                      if (Array.isArray(arr)) inclusionsCount = arr.length;
                    }
                  } catch {}

                  return (
                    <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Item Type Badge */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            isPackage
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-[#16C7FF]/10 text-[#16C7FF] border border-[#16C7FF]/20"
                          }`}
                        >
                          {isPackage ? <Package className="size-3" /> : <Layers className="size-3" />}
                          <span>{isPackage ? "Package" : "Service"}</span>
                        </span>
                      </td>

                      {/* Name & Slug */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="font-semibold text-white group-hover:text-[#16C7FF] transition-colors">
                          {service.name}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono truncate">{service.slug}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono text-white/70">
                          {service.category}
                        </span>
                      </td>

                      {/* Authoritative Pricing */}
                      <td className="py-3.5 px-4 font-medium text-white/90 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="size-3.5 text-[#16C7FF]" />
                          <span>{formatPrice(service)}</span>
                        </div>
                        {service.adBudgetSeparate && (
                          <div className="text-[9px] text-amber-400 font-mono mt-0.5">
                            Ad budget separate
                          </div>
                        )}
                      </td>

                      {/* Deliverables Count */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] text-white/60">
                          {inclusionsCount > 0 ? `${inclusionsCount} items` : "—"}
                        </span>
                      </td>

                      {/* Order */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-white/40">
                        {service.displayOrder}
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleActive(service)}
                          disabled={togglingId === service.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                            service.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              service.isActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"
                            }`}
                          />
                          <span>{service.isActive ? "Active" : "Disabled"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEdit(service)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDelete(service)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-white/70 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS (Visible on mobile/tablet) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {filteredServices.map((service) => {
              const isPackage = service.itemType === "package";
              return (
                <div
                  key={service.id}
                  className="p-4 rounded-2xl bg-[#090C12] border border-white/10 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPackage
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-[#16C7FF]/10 text-[#16C7FF] border border-[#16C7FF]/20"
                      }`}
                    >
                      {isPackage ? <Package className="size-3" /> : <Layers className="size-3" />}
                      <span>{isPackage ? "Package" : "Service"}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleActive(service)}
                      disabled={togglingId === service.id}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        service.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      {service.isActive ? "Active" : "Disabled"}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">{service.name}</h4>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">{service.slug}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">Price:</span>
                    <span className="font-semibold text-white">{formatPrice(service)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-white/40 font-mono">
                      Category: {service.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenEdit(service)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onOpenDelete(service)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-white/50 hover:text-rose-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
