"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, RefreshCw, Layers, Package, AlertCircle } from "lucide-react";
import type { BrainService } from "./types";
import { SERVICE_CATEGORIES } from "./types";

interface ServiceModalProps {
  isOpen: boolean;
  service: BrainService | null; // null for new
  defaultItemType?: "service" | "package";
  onClose: () => void;
  onSave: (savedService: BrainService) => void;
}

export default function ServiceModal({
  isOpen,
  service,
  defaultItemType = "service",
  onClose,
  onSave,
}: ServiceModalProps) {
  const isEdit = Boolean(service);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("social-media");
  const [customCategory, setCustomCategory] = useState("");
  const [itemType, setItemType] = useState<"service" | "package">("service");
  const [pricingType, setPricingType] = useState<"fixed" | "starting_from" | "custom_quote">("fixed");
  const [price, setPrice] = useState<string>("");
  const [startingPrice, setStartingPrice] = useState<string>("");
  const [currency, setCurrency] = useState("LKR");
  const [unit, setUnit] = useState("");
  const [adBudgetSeparate, setAdBudgetSeparate] = useState(false);
  const [sku, setSku] = useState("");
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [newInclusion, setNewInclusion] = useState("");
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [newExclusion, setNewExclusion] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize state on open or service change
  useEffect(() => {
    if (service) {
      setName(service.name);
      setSlug(service.slug);
      setDescription(service.description || "");
      const isKnownCategory = SERVICE_CATEGORIES.some((c) => c.value === service.category);
      if (isKnownCategory) {
        setCategory(service.category);
        setCustomCategory("");
      } else {
        setCategory("custom");
        setCustomCategory(service.category);
      }
      setItemType(service.itemType);
      setPricingType(service.pricingType);
      setPrice(service.price !== null && service.price !== undefined ? String(service.price) : "");
      setStartingPrice(
        service.startingPrice !== null && service.startingPrice !== undefined
          ? String(service.startingPrice)
          : ""
      );
      setCurrency(service.currency || "LKR");
      setUnit(service.unit || "");
      setAdBudgetSeparate(Boolean(service.adBudgetSeparate));
      setSku(service.sku || "");

      // Inclusions
      try {
        if (service.inclusions) {
          const parsed = JSON.parse(service.inclusions);
          setInclusions(Array.isArray(parsed) ? parsed : []);
        } else {
          setInclusions([]);
        }
      } catch {
        setInclusions([]);
      }

      // Exclusions
      try {
        if (service.exclusions) {
          const parsed = JSON.parse(service.exclusions);
          setExclusions(Array.isArray(parsed) ? parsed : []);
        } else {
          setExclusions([]);
        }
      } catch {
        setExclusions([]);
      }

      setIsActive(service.isActive);
      setDisplayOrder(service.displayOrder);
    } else {
      // Defaults for new item
      setName("");
      setSlug("");
      setDescription("");
      setCategory("social-media");
      setCustomCategory("");
      setItemType(defaultItemType);
      setPricingType(defaultItemType === "package" ? "fixed" : "starting_from");
      setPrice("");
      setStartingPrice("");
      setCurrency("LKR");
      setUnit(defaultItemType === "package" ? "per month" : "per project");
      setAdBudgetSeparate(false);
      setSku("");
      setInclusions([]);
      setExclusions([]);
      setIsActive(true);
      setDisplayOrder(0);
    }
    setError(null);
  }, [service, defaultItemType, isOpen]);

  if (!isOpen) return null;

  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    setInclusions([...inclusions, newInclusion.trim()]);
    setNewInclusion("");
  };

  const handleRemoveInclusion = (idx: number) => {
    setInclusions(inclusions.filter((_, i) => i !== idx));
  };

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    setExclusions([...exclusions, newExclusion.trim()]);
    setNewExclusion("");
  };

  const handleRemoveExclusion = (idx: number) => {
    setExclusions(exclusions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const finalCategory = category === "custom" ? customCategory.trim() : category;
    if (!finalCategory) {
      setError("Please specify a category.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim() || null,
        category: finalCategory,
        itemType,
        pricingType,
        price: price.trim() !== "" ? Number(price) : null,
        startingPrice: startingPrice.trim() !== "" ? Number(startingPrice) : null,
        currency: currency.trim() || "LKR",
        unit: unit.trim() || null,
        adBudgetSeparate,
        sku: sku.trim() || null,
        inclusions,
        exclusions,
        isActive,
        displayOrder: Number(displayOrder) || 0,
      };

      if (slug.trim()) {
        payload.slug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
      }

      const url = isEdit ? `/api/admin/brain/services/${service!.id}` : "/api/admin/brain/services";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save service");
      }

      onSave(data.service);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl my-8 bg-[#090C12] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
              {itemType === "package" ? <Package className="size-5" /> : <Layers className="size-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? `Edit ${itemType === "package" ? "Package" : "Service"}` : `New ${itemType === "package" ? "Package" : "Service"}`}
              </h2>
              <p className="text-xs text-white/50">Configure authoritative knowledge and pricing for HIVE AI</p>
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

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-white/70 mb-1.5">Item Classification</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setItemType("service")}
                  className={`py-2 px-3 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all ${
                    itemType === "service"
                      ? "bg-[#16C7FF]/15 border-[#16C7FF] text-[#16C7FF]"
                      : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <Layers className="size-3.5" />
                  <span>Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => setItemType("package")}
                  className={`py-2 px-3 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all ${
                    itemType === "package"
                      ? "bg-purple-500/15 border-purple-500 text-purple-400"
                      : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <Package className="size-3.5" />
                  <span>Package Tier</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-white/70 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#090C12] text-white">
                    {cat.label}
                  </option>
                ))}
                <option value="custom" className="bg-[#090C12] text-white">
                  + Custom Category...
                </option>
              </select>
              {category === "custom" && (
                <input
                  type="text"
                  placeholder="Enter custom category key (e.g. motion-graphics)"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
                />
              )}
            </div>
          </div>

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-white/70 mb-1.5">
                {itemType === "package" ? "Package Name" : "Service Name"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Social Media Growth Package"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
              />
            </div>
            <div>
              <label className="block font-medium text-white/70 mb-1.5">
                Slug <span className="text-white/40 text-[10px]">(Optional, auto-generated if blank)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. social-media-growth-package"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-[#16C7FF]/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary of this service or package for AI sales concierge knowledge..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50 resize-none"
            />
          </div>

          {/* Pricing Section */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Pricing Configuration (LKR)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-white/70 mb-1">Pricing Model</label>
                <select
                  value={pricingType}
                  onChange={(e) => setPricingType(e.target.value as "fixed" | "starting_from" | "custom_quote")}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
                >
                  <option value="fixed" className="bg-[#090C12] text-white">Fixed Price</option>
                  <option value="starting_from" className="bg-[#090C12] text-white">Starting From</option>
                  <option value="custom_quote" className="bg-[#090C12] text-white">Custom Quote</option>
                </select>
              </div>

              {pricingType === "fixed" ? (
                <div>
                  <label className="block font-medium text-white/70 mb-1">Exact Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 55000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
                  />
                </div>
              ) : pricingType === "starting_from" ? (
                <div>
                  <label className="block font-medium text-white/70 mb-1">Starting Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 14000"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-medium text-white/70 mb-1">Estimate (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional base"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-white/70 mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="e.g. per month, per design"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adBudgetSeparate}
                  onChange={(e) => setAdBudgetSeparate(e.target.checked)}
                  className="rounded bg-[#0B0F19] border-white/20 text-[#16C7FF] focus:ring-[#16C7FF]/30 size-4"
                />
                <span className="text-white/80">Ad budget is separate from package fee</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-white/50">SKU:</span>
                <input
                  type="text"
                  placeholder="e.g. SMM-PKG-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-white/10 text-white font-mono text-[10px] w-32 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Deliverables / Inclusions Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-white/80">
                Inclusions & Deliverables ({inclusions.length})
              </label>
              <span className="text-[10px] text-white/40 font-mono">Bullet points shown to clients</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a deliverable (e.g. 15 custom Instagram posts / mo)..."
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInclusion();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="px-3.5 py-2 rounded-xl bg-[#16C7FF] text-black font-semibold hover:bg-[#16C7FF]/90 transition-colors shrink-0"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {inclusions.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {inclusions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-white/10"
                  >
                    <span className="text-white/90">• {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInclusion(idx)}
                      className="text-white/30 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exclusions Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-white/80">
                Exclusions ({exclusions.length})
              </label>
              <span className="text-[10px] text-white/40 font-mono">Explicitly not included in package</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add an exclusion (e.g. Meta paid ad spend not included)..."
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddExclusion();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
              />
              <button
                type="button"
                onClick={handleAddExclusion}
                className="px-3.5 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {exclusions.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {exclusions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-500/[0.02] border border-rose-500/10 group"
                  >
                    <span className="text-white/80">✕ {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExclusion(idx)}
                      className="text-white/30 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Display Order & Active Toggle */}
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
              <span className="font-semibold text-emerald-400">Active in AI Knowledge</span>
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
            <span>{loading ? "Saving..." : isEdit ? "Save Changes" : "Create Item"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
