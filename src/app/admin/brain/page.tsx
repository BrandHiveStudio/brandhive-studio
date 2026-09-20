"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  LayoutDashboard,
  Layers,
  Sliders,
  HelpCircle,
  Settings2,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import type { BrainService, BrainAddon, BrainFaq, BrainSetting } from "./components/types";
import BrainOverview from "./components/BrainOverview";
import BrainServicesTab from "./components/BrainServicesTab";
import ServiceModal from "./components/ServiceModal";
import BrainAddonsTab from "./components/BrainAddonsTab";
import AddonModal from "./components/AddonModal";
import BrainFaqsTab from "./components/BrainFaqsTab";
import FaqModal from "./components/FaqModal";
import BrainSettingsTab from "./components/BrainSettingsTab";
import SettingModal from "./components/SettingModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

type ActiveTab = "overview" | "services" | "addons" | "faqs" | "settings";

function BrainWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = (searchParams.get("tab") as ActiveTab) || "overview";
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    ["overview", "services", "addons", "faqs", "settings"].includes(tabParam)
      ? tabParam
      : "overview"
  );

  // Sync tab with URL
  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Live Data State
  const [services, setServices] = useState<BrainService[]>([]);
  const [addons, setAddons] = useState<BrainAddon[]>([]);
  const [faqs, setFaqs] = useState<BrainFaq[]>([]);
  const [settings, setSettings] = useState<BrainSetting[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Toast / Notification banner
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Modals state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BrainService | null>(null);
  const [defaultServiceType, setDefaultServiceType] = useState<"service" | "package">("service");

  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<BrainAddon | null>(null);

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<BrainFaq | null>(null);

  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<BrainSetting | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleteItemName, setDeleteItemName] = useState("");
  const [deleteItemType, setDeleteItemType] = useState("");
  const [deleteHandler, setDeleteHandler] = useState<() => Promise<void>>(() => async () => {});
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Quick Toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch all Brain data from server-side APIs
  const fetchBrainData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const [servicesRes, addonsRes, faqsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/brain/services"),
        fetch("/api/admin/brain/addons"),
        fetch("/api/admin/brain/faqs"),
        fetch("/api/admin/brain/settings"),
      ]);

      const [servicesData, addonsData, faqsData, settingsData] = await Promise.all([
        servicesRes.json(),
        addonsRes.json(),
        faqsRes.json(),
        settingsRes.json(),
      ]);

      if (!servicesRes.ok || !servicesData.ok) {
        throw new Error(servicesData.error || "Failed to load Brain services");
      }
      if (!addonsRes.ok || !addonsData.ok) {
        throw new Error(addonsData.error || "Failed to load Brain add-ons");
      }
      if (!faqsRes.ok || !faqsData.ok) {
        throw new Error(faqsData.error || "Failed to load Brain FAQs");
      }
      if (!settingsRes.ok || !settingsData.ok) {
        throw new Error(settingsData.error || "Failed to load Brain settings");
      }

      setServices(servicesData.services || []);
      setAddons(addonsData.addons || []);
      setFaqs(faqsData.faqs || []);
      setSettings(settingsData.settings || []);
    } catch (err: unknown) {
      console.error("[HIVE Brain] Error fetching data:", err);
      setFetchError(err instanceof Error ? err.message : "Error connecting to Brain API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrainData();
  }, [fetchBrainData]);

  // ===========================================================================
  // SERVICE HANDLERS
  // ===========================================================================
  const handleOpenCreateService = (type: "service" | "package" = "service") => {
    setEditingService(null);
    setDefaultServiceType(type);
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service: BrainService) => {
    setEditingService(service);
    setDefaultServiceType(service.itemType);
    setServiceModalOpen(true);
  };

  const handleSavedService = (saved: BrainService) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) {
        return prev.map((s) => (s.id === saved.id ? saved : s));
      }
      return [saved, ...prev];
    });
    showToast(`Service "${saved.name}" saved successfully`);
  };

  const handleToggleServiceActive = async (service: BrainService) => {
    const nextState = !service.isActive;
    setTogglingId(service.id);
    try {
      const res = await fetch(`/api/admin/brain/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to toggle status");

      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: nextState } : s))
      );
      showToast(
        `"${service.name}" is now ${nextState ? "active" : "disabled"} in HIVE AI knowledge`
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to toggle status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenDeleteService = (service: BrainService) => {
    setDeleteTitle("Delete Service Record");
    setDeleteItemName(service.name);
    setDeleteItemType(service.itemType === "package" ? "package tier" : "service offering");
    setDeleteError(null);
    setDeleteHandler(() => async () => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        const res = await fetch(`/api/admin/brain/services/${service.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to delete service");

        setServices((prev) => prev.filter((s) => s.id !== service.id));
        setDeleteModalOpen(false);
        showToast(`Service "${service.name}" permanently deleted`);
      } catch (err: unknown) {
        setDeleteError(err instanceof Error ? err.message : "Deletion failed");
      } finally {
        setIsDeleting(false);
      }
    });
    setDeleteModalOpen(true);
  };

  // ===========================================================================
  // ADD-ON HANDLERS
  // ===========================================================================
  const handleOpenCreateAddon = () => {
    setEditingAddon(null);
    setAddonModalOpen(true);
  };

  const handleOpenEditAddon = (addon: BrainAddon) => {
    setEditingAddon(addon);
    setAddonModalOpen(true);
  };

  const handleSavedAddon = (saved: BrainAddon) => {
    setAddons((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      if (exists) {
        return prev.map((a) => (a.id === saved.id ? saved : a));
      }
      return [saved, ...prev];
    });
    showToast(`Add-on "${saved.name}" saved successfully`);
  };

  const handleToggleAddonActive = async (addon: BrainAddon) => {
    const nextState = !addon.isActive;
    setTogglingId(addon.id);
    try {
      const res = await fetch(`/api/admin/brain/addons/${addon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to toggle status");

      setAddons((prev) =>
        prev.map((a) => (a.id === addon.id ? { ...a, isActive: nextState } : a))
      );
      showToast(`Add-on "${addon.name}" is now ${nextState ? "active" : "disabled"}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to toggle status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenDeleteAddon = (addon: BrainAddon) => {
    setDeleteTitle("Delete Add-on Record");
    setDeleteItemName(addon.name);
    setDeleteItemType("service add-on");
    setDeleteError(null);
    setDeleteHandler(() => async () => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        const res = await fetch(`/api/admin/brain/addons/${addon.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to delete add-on");

        setAddons((prev) => prev.filter((a) => a.id !== addon.id));
        setDeleteModalOpen(false);
        showToast(`Add-on "${addon.name}" deleted`);
      } catch (err: unknown) {
        setDeleteError(err instanceof Error ? err.message : "Deletion failed");
      } finally {
        setIsDeleting(false);
      }
    });
    setDeleteModalOpen(true);
  };

  // ===========================================================================
  // FAQ HANDLERS
  // ===========================================================================
  const handleOpenCreateFaq = () => {
    setEditingFaq(null);
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: BrainFaq) => {
    setEditingFaq(faq);
    setFaqModalOpen(true);
  };

  const handleSavedFaq = (saved: BrainFaq) => {
    setFaqs((prev) => {
      const exists = prev.some((f) => f.id === saved.id);
      if (exists) {
        return prev.map((f) => (f.id === saved.id ? saved : f));
      }
      return [saved, ...prev];
    });
    showToast(`FAQ saved successfully`);
  };

  const handleToggleFaqActive = async (faq: BrainFaq) => {
    const nextState = !faq.isActive;
    setTogglingId(faq.id);
    try {
      const res = await fetch(`/api/admin/brain/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to toggle status");

      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, isActive: nextState } : f))
      );
      showToast(`FAQ is now ${nextState ? "active" : "disabled"}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to toggle status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenDeleteFaq = (faq: BrainFaq) => {
    setDeleteTitle("Delete FAQ Record");
    setDeleteItemName(faq.question);
    setDeleteItemType("FAQ question");
    setDeleteError(null);
    setDeleteHandler(() => async () => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        const res = await fetch(`/api/admin/brain/faqs/${faq.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to delete FAQ");

        setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
        setDeleteModalOpen(false);
        showToast("FAQ permanently deleted");
      } catch (err: unknown) {
        setDeleteError(err instanceof Error ? err.message : "Deletion failed");
      } finally {
        setIsDeleting(false);
      }
    });
    setDeleteModalOpen(true);
  };

  // ===========================================================================
  // SETTINGS HANDLERS
  // ===========================================================================
  const handleOpenCreateSetting = () => {
    setEditingSetting(null);
    setSettingModalOpen(true);
  };

  const handleOpenEditSetting = (setting: BrainSetting) => {
    setEditingSetting(setting);
    setSettingModalOpen(true);
  };

  const handleSavedSetting = (saved: BrainSetting) => {
    setSettings((prev) => {
      const exists = prev.some((s) => s.key === saved.key || s.id === saved.id);
      if (exists) {
        return prev.map((s) => (s.key === saved.key || s.id === saved.id ? saved : s));
      }
      return [...prev, saved];
    });
    showToast(`Setting "${saved.key}" saved successfully`);
  };

  const handleToggleSettingActive = async (setting: BrainSetting) => {
    const nextState = !setting.isActive;
    setTogglingId(setting.id || setting.key);
    try {
      const res = await fetch(
        `/api/admin/brain/settings/${encodeURIComponent(setting.key)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextState }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to toggle status");

      setSettings((prev) =>
        prev.map((s) =>
          s.key === setting.key || s.id === setting.id ? { ...s, isActive: nextState } : s
        )
      );
      showToast(`Setting "${setting.key}" is now ${nextState ? "active" : "disabled"}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to toggle status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenDeleteSetting = (setting: BrainSetting) => {
    setDeleteTitle("Delete Setting Record");
    setDeleteItemName(setting.key);
    setDeleteItemType("business parameter");
    setDeleteError(null);
    setDeleteHandler(() => async () => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        const res = await fetch(
          `/api/admin/brain/settings/${encodeURIComponent(setting.key)}`,
          {
            method: "DELETE",
          }
        );
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to delete setting");

        setSettings((prev) => prev.filter((s) => s.key !== setting.key && s.id !== setting.id));
        setDeleteModalOpen(false);
        showToast(`Setting "${setting.key}" deleted`);
      } catch (err: unknown) {
        setDeleteError(err instanceof Error ? err.message : "Deletion failed");
      } finally {
        setIsDeleting(false);
      }
    });
    setDeleteModalOpen(true);
  };

  // Nav tabs config
  const navTabs: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "services", label: "Services & Packages", icon: Layers, count: services.length },
    { id: "addons", label: "Add-ons", icon: Sliders, count: addons.length },
    { id: "faqs", label: "FAQs", icon: HelpCircle, count: faqs.length },
    { id: "settings", label: "Business Knowledge", icon: Settings2, count: settings.length },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium animate-in slide-in-from-top duration-200 ${
            toast.type === "success"
              ? "bg-[#090C12] border-emerald-500/30 text-emerald-300 shadow-emerald-500/10"
              : "bg-[#090C12] border-rose-500/30 text-rose-300 shadow-rose-500/10"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#16C7FF]/20 to-[#0D85FF]/20 border border-[#16C7FF]/30 flex items-center justify-center text-[#16C7FF] shadow-[0_0_20px_rgba(22,199,255,0.2)]">
              <Brain className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                HIVE AI Brain Workspace
              </h1>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                Manage authoritative services, packages, add-ons, FAQs, and business policies stored in Turso.
              </p>
            </div>
          </div>
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={fetchBrainData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-medium transition-all shrink-0 self-start sm:self-center"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#16C7FF]" : ""}`} />
          <span>Sync Turso</span>
        </button>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#090C12] border border-white/10 overflow-x-auto text-xs no-scrollbar">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-[#16C7FF] text-black shadow-lg shadow-[#16C7FF]/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isActive ? "bg-black/20 text-black font-bold" : "bg-white/5 text-white/40"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="p-20 rounded-3xl bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
          <RefreshCw className="size-8 text-[#16C7FF] animate-spin" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Connecting to Turso HIVE Brain...</h3>
            <p className="text-xs text-white/50">Fetching authoritative knowledge records and pricing tables</p>
          </div>
        </div>
      ) : fetchError ? (
        <div className="p-12 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-4">
          <AlertCircle className="size-10 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Failed to connect to Brain API</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{fetchError}</p>
          </div>
          <button
            onClick={fetchBrainData}
            className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <BrainOverview
              services={services}
              addons={addons}
              faqs={faqs}
              settings={settings}
              onNavigateTab={(tab) => handleTabChange(tab)}
              onOpenCreateService={handleOpenCreateService}
              onOpenCreateFaq={handleOpenCreateFaq}
            />
          )}

          {/* TAB 2: SERVICES & PACKAGES */}
          {activeTab === "services" && (
            <BrainServicesTab
              services={services}
              onOpenCreate={handleOpenCreateService}
              onOpenEdit={handleOpenEditService}
              onOpenDelete={handleOpenDeleteService}
              onToggleActive={handleToggleServiceActive}
              togglingId={togglingId}
            />
          )}

          {/* TAB 3: ADD-ONS */}
          {activeTab === "addons" && (
            <BrainAddonsTab
              addons={addons}
              services={services}
              onOpenCreate={handleOpenCreateAddon}
              onOpenEdit={handleOpenEditAddon}
              onOpenDelete={handleOpenDeleteAddon}
              onToggleActive={handleToggleAddonActive}
              togglingId={togglingId}
            />
          )}

          {/* TAB 4: FAQS */}
          {activeTab === "faqs" && (
            <BrainFaqsTab
              faqs={faqs}
              onOpenCreate={handleOpenCreateFaq}
              onOpenEdit={handleOpenEditFaq}
              onOpenDelete={handleOpenDeleteFaq}
              onToggleActive={handleToggleFaqActive}
              togglingId={togglingId}
            />
          )}

          {/* TAB 5: BUSINESS KNOWLEDGE & POLICIES */}
          {activeTab === "settings" && (
            <BrainSettingsTab
              settings={settings}
              onOpenCreate={handleOpenCreateSetting}
              onOpenEdit={handleOpenEditSetting}
              onOpenDelete={handleOpenDeleteSetting}
              onToggleActive={handleToggleSettingActive}
              togglingId={togglingId}
            />
          )}
        </>
      )}

      {/* ======================================================================= */}
      {/* MODALS */}
      {/* ======================================================================= */}

      {/* Service / Package Modal */}
      <ServiceModal
        isOpen={serviceModalOpen}
        service={editingService}
        defaultItemType={defaultServiceType}
        onClose={() => setServiceModalOpen(false)}
        onSave={handleSavedService}
      />

      {/* Add-on Modal */}
      <AddonModal
        isOpen={addonModalOpen}
        addon={editingAddon}
        services={services}
        onClose={() => setAddonModalOpen(false)}
        onSave={handleSavedAddon}
      />

      {/* FAQ Modal */}
      <FaqModal
        isOpen={faqModalOpen}
        faq={editingFaq}
        onClose={() => setFaqModalOpen(false)}
        onSave={handleSavedFaq}
      />

      {/* Setting Modal */}
      <SettingModal
        isOpen={settingModalOpen}
        setting={editingSetting}
        onClose={() => setSettingModalOpen(false)}
        onSave={handleSavedSetting}
      />

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title={deleteTitle}
        itemName={deleteItemName}
        itemTypeDescription={deleteItemType}
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={deleteHandler}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default function AdminBrainPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
          <RefreshCw className="size-8 text-[#16C7FF] animate-spin" />
          <p className="text-xs text-white/50">Loading HIVE Brain Portal...</p>
        </div>
      }
    >
      <BrainWorkspaceContent />
    </Suspense>
  );
}
