"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Sliders,
  Edit2,
  Trash2,
  X,
  Layers,
  Globe,
  DollarSign,
} from "lucide-react";
import type { BrainAddon, BrainService } from "./types";

interface BrainAddonsTabProps {
  addons: BrainAddon[];
  services: BrainService[];
  onOpenCreate: () => void;
  onOpenEdit: (addon: BrainAddon) => void;
  onOpenDelete: (addon: BrainAddon) => void;
  onToggleActive: (addon: BrainAddon) => Promise<void> | void;
  togglingId: string | null;
}

export default function BrainAddonsTab({
  addons,
  services,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onToggleActive,
  togglingId,
}: BrainAddonsTabProps) {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Create service lookup map
  const serviceMap = useMemo(() => {
    const map: Record<string, BrainService> = {};
    services.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [services]);

  const filteredAddons = useMemo(() => {
    return addons.filter((a) => {
      if (statusFilter === "active" && !a.isActive) return false;
      if (statusFilter === "inactive" && a.isActive) return false;

      if (serviceFilter === "global" && a.serviceId !== null) return false;
      if (serviceFilter !== "all" && serviceFilter !== "global" && a.serviceId !== serviceFilter) {
        return false;
      }

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const parentName = a.serviceId ? serviceMap[a.serviceId]?.name?.toLowerCase() || "" : "";
      return (
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        parentName.includes(q)
      );
    });
  }, [addons, search, serviceFilter, statusFilter, serviceMap]);

  const formatPrice = (addon: BrainAddon) => {
    const curr = addon.currency || "LKR";
    const unitStr = addon.unit ? ` / ${addon.unit.replace(/^per\s+/i, "")}` : "";

    if (addon.pricingType === "fixed" && addon.price !== null) {
      return `${curr} ${addon.price.toLocaleString()}${unitStr}`;
    }
    if (addon.pricingType === "starting_from" && addon.startingPrice !== null) {
      return `From ${curr} ${addon.startingPrice.toLocaleString()}${unitStr}`;
    }
    if (addon.price !== null) {
      return `${curr} ${addon.price.toLocaleString()}${unitStr}`;
    }
    return "Custom Quote";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search add-ons by name or description..."
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

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16C7FF] text-black font-semibold text-xs hover:bg-[#16C7FF]/90 transition-all shadow-lg shadow-[#16C7FF]/20 active:scale-95 whitespace-nowrap"
        >
          <Plus className="size-3.5" />
          <span>New Add-on</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#090C12] border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-[11px]">Associated Service:</span>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none max-w-xs"
          >
            <option value="all">All Add-ons ({addons.length})</option>
            <option value="global">🌐 Global Add-ons Only</option>
            <optgroup label="Specific Services">
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
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

      {/* Addons List */}
      {filteredAddons.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <Sliders className="size-7" />
          </div>
          <h3 className="text-base font-bold text-white">No add-ons found</h3>
          <p className="text-xs text-white/50 max-w-sm mt-1 mb-6">
            {search || serviceFilter !== "all" || statusFilter !== "all"
              ? "No add-ons match the current filter selection."
              : "No add-on records found in Turso. Create your first service add-on."}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block rounded-3xl bg-[#090C12] border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/[0.02] border-b border-white/5 text-white/40 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Add-on Name</th>
                  <th className="py-3.5 px-4">Associated Scope</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAddons.map((addon) => {
                  const parent = addon.serviceId ? serviceMap[addon.serviceId] : null;

                  return (
                    <tr key={addon.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name & Description */}
                      <td className="py-3.5 px-5 max-w-sm">
                        <div className="font-semibold text-white group-hover:text-[#16C7FF] transition-colors">
                          {addon.name}
                        </div>
                        {addon.description && (
                          <div className="text-[11px] text-white/40 truncate mt-0.5">
                            {addon.description}
                          </div>
                        )}
                      </td>

                      {/* Associated Scope */}
                      <td className="py-3.5 px-4">
                        {parent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Layers className="size-3" />
                            <span className="truncate max-w-[180px]">{parent.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Globe className="size-3" />
                            <span>Global Add-on</span>
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 font-medium text-white/90 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="size-3.5 text-[#16C7FF]" />
                          <span>{formatPrice(addon)}</span>
                        </div>
                      </td>

                      {/* Order */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-white/40">
                        {addon.displayOrder}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleActive(addon)}
                          disabled={togglingId === addon.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                            addon.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              addon.isActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"
                            }`}
                          />
                          <span>{addon.isActive ? "Active" : "Disabled"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEdit(addon)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDelete(addon)}
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

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
            {filteredAddons.map((addon) => {
              const parent = addon.serviceId ? serviceMap[addon.serviceId] : null;

              return (
                <div
                  key={addon.id}
                  className="p-4 rounded-2xl bg-[#090C12] border border-white/10 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white text-sm">{addon.name}</span>
                    <button
                      type="button"
                      onClick={() => onToggleActive(addon)}
                      disabled={togglingId === addon.id}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        addon.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      {addon.isActive ? "Active" : "Disabled"}
                    </button>
                  </div>

                  {addon.description && (
                    <p className="text-xs text-white/50">{addon.description}</p>
                  )}

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">Price:</span>
                    <span className="font-semibold text-white">{formatPrice(addon)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="text-white/40">
                      {parent ? parent.name : "Global"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenEdit(addon)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-white text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onOpenDelete(addon)}
                        className="p-1 rounded-lg bg-white/5 text-white/40 hover:text-rose-400"
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
