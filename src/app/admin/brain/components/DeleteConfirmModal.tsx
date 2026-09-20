"use client";

import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemTypeDescription?: string;
  isLoading: boolean;
  error?: string | null;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  itemTypeDescription = "record",
  isLoading,
  error,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#090C12] border border-rose-500/20 rounded-2xl shadow-2xl p-6 text-white space-y-5">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-white/50">This action cannot be undone.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70 space-y-1">
          <p>
            Are you sure you want to permanently delete this {itemTypeDescription} from the HIVE AI Brain?
          </p>
          <p className="font-semibold text-white break-words">
            &ldquo;{itemName}&rdquo;
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {isLoading && <RefreshCw className="size-3.5 animate-spin" />}
            <span>{isLoading ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
