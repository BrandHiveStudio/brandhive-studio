"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export const COOKIE_CONSENT_KEY = "brandhive_cookie_consent";
export const CONSENT_CHANGED_EVENT = "brandhive:consent-changed";
export const OPEN_SETTINGS_EVENT = "brandhive:open-cookie-settings";

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp?: number;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export default function CookieConsent() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  // Check saved preferences on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPrefs({
          essential: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          preferences: Boolean(parsed.preferences),
          timestamp: parsed.timestamp,
        });
      } else {
        // No choice made yet - show banner
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  // Listen for open-cookie-settings event
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowModal(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT, handleOpenSettings);
    return () => {
      window.removeEventListener(OPEN_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const savePreferences = useCallback((newPreferences: CookiePreferences) => {
    const toSave: CookiePreferences = {
      ...newPreferences,
      essential: true,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn("Unable to save cookie preferences to localStorage", e);
    }

    setPrefs(toSave);
    setShowBanner(false);
    setShowModal(false);

    // Dispatch custom event for real-time listener updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(CONSENT_CHANGED_EVENT, { detail: toSave })
      );
    }
  }, []);

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const handleSaveModal = () => {
    savePreferences(prefs);
  };

  // Don't render on admin pages or before mount
  if (!mounted || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* 1. Main Cookie Consent Floating Banner */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="region"
            aria-label="Cookie consent banner"
            className="fixed bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:max-w-xl z-[9990] pointer-events-auto"
          >
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0B111A]/95 backdrop-blur-xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.65),0_0_20px_rgba(22,199,255,0.05)] text-white">
              
              {/* Header with Icon */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="size-7 rounded-lg bg-[#12BDF7]/10 border border-[#12BDF7]/25 flex items-center justify-center text-[#12BDF7] shrink-0">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Cookie Preferences &amp; Privacy
                </h2>
              </div>

              {/* Notice Text */}
              <p className="text-xs text-white/70 leading-relaxed font-normal">
                We use cookies and similar technologies to help operate our website, understand website usage and improve your experience. Learn more in our{" "}
                <Link
                  href="/cookie-policy"
                  className="text-[#12BDF7] hover:text-[#60D6FF] underline font-medium transition-colors"
                >
                  Cookie Policy
                </Link>.
              </p>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-[#12BDF7] to-[#0096C7] hover:from-[#38bdf8] hover:to-[#12BDF7] text-[#050608] text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(18,189,247,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12BDF7]"
                >
                  Accept All
                </button>

                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/90 border border-white/10 text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Reject Non-Essential
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto px-3 py-2 text-xs text-white/60 hover:text-white transition-colors underline-offset-4 hover:underline text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg"
                >
                  Manage Preferences
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Detailed Preference Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-modal-title"
              className="relative w-full max-w-lg rounded-2xl bg-[#0B111A] border border-white/15 p-6 sm:p-7 text-white shadow-2xl z-10 my-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 id="cookie-modal-title" className="text-lg font-bold text-white tracking-tight">
                    Cookie &amp; Privacy Preferences
                  </h2>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Customize your technology and cookie choices below. Read our{" "}
                    <Link href="/cookie-policy" className="text-[#12BDF7] underline">
                      Cookie Policy
                    </Link>{" "}
                    for full details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close cookie settings dialog"
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Preference Categories */}
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                
                {/* 1. Essential (Always Active) */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Essential</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Always Active
                      </span>
                    </div>
                    <p className="text-[11px] text-white/55 leading-relaxed">
                      Required for website navigation, technical security, session handling, and core functionality. Cannot be disabled.
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-not-allowed opacity-80 pt-1 shrink-0">
                    <div className="w-10 h-6 bg-emerald-500/30 rounded-full border border-emerald-400/40 flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* 2. Analytics */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Analytics</span>
                    <p className="text-[11px] text-white/55 leading-relaxed">
                      Enables Google Analytics (ID G-S2Z1B36031) to anonymously measure page visits and user journeys to help us improve website performance.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs.analytics}
                    onClick={() => setPrefs((prev) => ({ ...prev, analytics: !prev.analytics }))}
                    className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer pt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12BDF7] ${
                      prefs.analytics ? "bg-[#12BDF7]" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 shadow ${
                        prefs.analytics ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Marketing */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Marketing</span>
                    <p className="text-[11px] text-white/55 leading-relaxed">
                      Used for promotional campaign tracking across advertising networks. Currently inactive by default.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs.marketing}
                    onClick={() => setPrefs((prev) => ({ ...prev, marketing: !prev.marketing }))}
                    className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer pt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12BDF7] ${
                      prefs.marketing ? "bg-[#12BDF7]" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 shadow ${
                        prefs.marketing ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Preferences */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Preferences</span>
                    <p className="text-[11px] text-white/55 leading-relaxed">
                      Allows our website to remember custom UI configurations, display settings, and interaction choices.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs.preferences}
                    onClick={() => setPrefs((prev) => ({ ...prev, preferences: !prev.preferences }))}
                    className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer pt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12BDF7] ${
                      prefs.preferences ? "bg-[#12BDF7]" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 shadow ${
                        prefs.preferences ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white/80 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                >
                  Reject All
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/15 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Accept All
                </button>

                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#12BDF7] to-[#0096C7] hover:from-[#38bdf8] hover:to-[#12BDF7] text-[#050608] text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
