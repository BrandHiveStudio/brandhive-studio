"use client";

import React, { useState, useEffect } from "react";
import { X, RefreshCw, Settings2, AlertCircle } from "lucide-react";
import type { BrainSetting } from "./types";

interface SettingModalProps {
  isOpen: boolean;
  setting: BrainSetting | null; // null for new
  onClose: () => void;
  onSave: (savedSetting: BrainSetting) => void;
}

export default function SettingModal({
  isOpen,
  setting,
  onClose,
  onSave,
}: SettingModalProps) {
  const isEdit = Boolean(setting);

  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (setting) {
      setKey(setting.key);
      setValue(setting.value);
      setDescription(setting.description || "");
      setIsActive(setting.isActive);
    } else {
      setKey("");
      setValue("");
      setDescription("");
      setIsActive(true);
    }
    setError(null);
  }, [setting, isOpen]);

  if (!isOpen) return null;

  // Detect if value is JSON
  let isJson = false;
  try {
    if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
      JSON.parse(value);
      isJson = true;
    }
  } catch {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!key.trim()) {
      setError("Setting key is required.");
      return;
    }

    if (!value.trim()) {
      setError("Setting value is required.");
      return;
    }

    setLoading(true);

    try {
      const sanitizedKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

      const payload = {
        key: sanitizedKey,
        value: value.trim(),
        description: description.trim() || null,
        isActive,
      };

      const url = isEdit
        ? `/api/admin/brain/settings/${encodeURIComponent(setting!.key)}`
        : "/api/admin/brain/settings";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save setting");
      }

      onSave(data.setting);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error while saving setting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl my-8 bg-[#090C12] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
              <Settings2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? "Edit Business Knowledge / Policy" : "New Business Knowledge / Policy"}
              </h2>
              <p className="text-xs text-white/50">Authoritative agency policy parameter stored in Turso</p>
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

          {/* Key */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">
              Setting Key <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              placeholder="e.g. payment_terms_standard"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-[#16C7FF]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isEdit && (
              <p className="text-[10px] text-white/40 font-mono mt-1">
                Unique identifier key cannot be renamed once created.
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-white/70 mb-1.5">Description / Purpose</label>
            <input
              type="text"
              placeholder="Explain how HIVE AI uses this policy or fact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white focus:outline-none focus:border-[#16C7FF]/50"
            />
          </div>

          {/* Value */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-white/70">
                Setting Value <span className="text-rose-400">*</span>
              </label>
              {isJson && (
                <span className="px-2 py-0.5 rounded-md bg-[#16C7FF]/10 text-[#16C7FF] text-[10px] font-mono border border-[#16C7FF]/20">
                  Valid JSON
                </span>
              )}
            </div>
            <textarea
              rows={6}
              required
              placeholder="Enter setting text, policy statement, working hours, or JSON structure..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#16C7FF]/50 resize-y"
            />
          </div>

          {/* Active Status */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-white/60">Include in HIVE AI Context:</span>
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
            <span>{loading ? "Saving..." : isEdit ? "Save Changes" : "Create Setting"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
