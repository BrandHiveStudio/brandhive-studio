"use client";

import React, { useState, useEffect } from "react";
import { X, RefreshCw, Sliders, AlertCircle } from "lucide-react";
import type { BrainAddon, BrainService } from "./types";

interface AddonModalProps {
  isOpen: boolean;
  addon: BrainAddon | null;
  services: BrainService[];
  onClose: () => void;
  onSave: (savedAddon: BrainAddon) => void;
}

export default function AddonModal({
  isOpen,
  addon,
  services,
  onClose,
  onSave,
}: AddonModalProps) {
  const isEdit = Boolean(addon);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [serviceId, setServiceId] = useState<string>("global");
  const [pricingType, setPricingType] = useState<string>("fixed");
  const [price, setPrice] = useState<string>("");
  const [startingPrice, setStartingPrice] = useState<string>("");
  const [currency, setCurrency] = useState("LKR");
  const [unit, setUnit] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (addon) {
      setName(addon.name);
      setDescription(addon.description || "");
      setServiceId(addon.serviceId || "global");
      setPricingType(addon.pricingType || "fixed");
      setPrice(addon.price !== null && addon.price !== undefined ? String(addon.price) : "");
      setStartingPrice(
        addon.startingPrice !== null && addon.startingPrice !== undefined
          ? String(addon.startingPrice)
          : ""
      );
      setCurrency(addon.currency || "LKR");
      setUnit(addon.unit || "");
      setIsActive(addon.isActive);
      setDisplayOrder(addon.displayOrder);
    } else {
      setName("");
      setDescription("");
      setServiceId("global");
      setPricingType("fixed");
      setPrice("");
      setStartingPrice("");
      setCurrency("LKR");
      setUnit("");
      setIsActive(true);
      setDisplayOrder(0);
    }
    setError(null);
  }, [addon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Add-on name is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        serviceId: serviceId === "global" ? null : serviceId,
        pricingType,
        price: price.trim() !== "" ? Number(price) : null,
        startingPrice: startingPrice.trim() !== "" ? Number(startingPrice) : null,
        currency: currency.trim() || "LKR",
        unit: unit.trim() || null,
        isActive,
        displayOrder: Number(displayOrder) || 0,
      };

      const url = isEdit ? `/api/admin/brain/addons/${addon!.id}` : "/api/admin/brain/addons";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save add-on");
      }

      onSave(data.addon);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error while saving add-on");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl my-8 bg-[#090C12] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? "Edit Service Add-on" : "New Service Add-on"}
              </h2>
              <p className="text-xs text-white/50">Configure optional upgrade pricing for HIVE AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">
              Add-on Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Extra 5 Animated Reels / mo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
            />
          </div>

          {/* Service Association */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">Service Association</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
            >
              <option value="global" className="bg-[#090C12] text-white">
                🌐 Global Add-on (Applicable to all services)
              </option>
              <optgroup label="Specific Services & Packages" className="bg-[#090C12] text-white">
                {services.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#090C12] text-white">
                    {s.itemType === "package" ? "📦 [Package] " : "⚡ [Service] "} {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">Description</label>
            <textarea
              rows={2}
              placeholder="Details about what this add-on provides..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50 resize-none"
            />
          </div>

          {/* Pricing Config */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Add-on Pricing (LKR)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-white/70 mb-1">Pricing Model</label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none"
                >
                  <option value="fixed" className="bg-[#090C12] text-white">Fixed Price</option>
                  <option value="starting_from" className="bg-[#090C12] text-white">Starting From</option>
                  <option value="custom_quote" className="bg-[#090C12] text-white">Custom Quote</option>
                </select>
              </div>

              {pricingType === "fixed" ? (
                <div>
                  <label className="block font-medium text-white/70 mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-medium text-white/70 mb-1">Starting Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10000"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-white/70 mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="e.g. per reel, per month"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Active status & Order */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <label className="font-medium text-white/70">Display Order:</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 text-white focus:outline-none text-center"
              />
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded bg-[#0B0F19] border-white/20 text-[#16C7FF] focus:ring-[#16C7FF]/30 size-4"
              />
              <span className="font-semibold text-emerald-400">Active</span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0B0F19]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#16C7FF] hover:bg-[#16C7FF]/90 text-black shadow-lg shadow-[#16C7FF]/20 transition-all disabled:opacity-50"
          >
            {loading && <RefreshCw className="size-3.5 animate-spin" />}
            <span>{loading ? "Saving..." : isEdit ? "Save Changes" : "Create Add-on"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
