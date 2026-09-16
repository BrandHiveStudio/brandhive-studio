"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  BarChart3, 
  Sparkles, 
  Compass, 
  Megaphone,
  Loader2,
  AlertCircle
} from "lucide-react";

interface FieldDefinition {
  key: string;
  label: string;
  description: string;
  type: "text" | "number" | "textarea";
  group: "Stats" | "Hero" | "About" | "CTA";
  placeholder?: string;
}

const FIELDS: FieldDefinition[] = [
  // Stats
  {
    key: "stats_projects_number",
    label: "Projects Delivered (Count)",
    description: "Numeric counter value rendered in homepage Stats and Hero sections",
    type: "text",
    group: "Stats",
    placeholder: "50",
  },
  {
    key: "stats_projects_suffix",
    label: "Projects Suffix Symbol",
    description: "Symbol displayed immediately after the project count (e.g., +)",
    type: "text",
    group: "Stats",
    placeholder: "+",
  },
  {
    key: "stats_projects_label",
    label: "Projects Metric Label",
    description: "Descriptive label for this statistic",
    type: "text",
    group: "Stats",
    placeholder: "Projects Delivered",
  },
  {
    key: "stats_clients_number",
    label: "Clients Served (Count)",
    description: "Numeric counter for satisfied clients and businesses served",
    type: "text",
    group: "Stats",
    placeholder: "25",
  },
  {
    key: "stats_clients_suffix",
    label: "Clients Suffix Symbol",
    description: "Symbol displayed next to clients count (e.g., +)",
    type: "text",
    group: "Stats",
    placeholder: "+",
  },
  {
    key: "stats_clients_label",
    label: "Clients Metric Label",
    description: "Descriptive label for client counter",
    type: "text",
    group: "Stats",
    placeholder: "Clients Served",
  },
  {
    key: "stats_years_number",
    label: "Years of Experience (Count)",
    description: "Number of years BrandHive Studio has been delivering creative excellence",
    type: "text",
    group: "Stats",
    placeholder: "2",
  },
  {
    key: "stats_years_suffix",
    label: "Years Suffix Symbol",
    description: "Symbol displayed after years count (e.g., +)",
    type: "text",
    group: "Stats",
    placeholder: "+",
  },
  {
    key: "stats_years_label",
    label: "Years Metric Label",
    description: "Descriptive label for agency experience",
    type: "text",
    group: "Stats",
    placeholder: "Years of Experience",
  },
  {
    key: "stats_satisfaction_number",
    label: "Client Satisfaction Rate",
    description: "Percentage score or rating value",
    type: "text",
    group: "Stats",
    placeholder: "100",
  },
  {
    key: "stats_satisfaction_suffix",
    label: "Satisfaction Suffix Symbol",
    description: "Percentage sign (%) or symbol",
    type: "text",
    group: "Stats",
    placeholder: "%",
  },
  {
    key: "stats_satisfaction_label",
    label: "Satisfaction Metric Label",
    description: "Descriptive label for client satisfaction",
    type: "text",
    group: "Stats",
    placeholder: "Client Satisfaction",
  },
  {
    key: "stats_awwwards_title",
    label: "Hero Badge Award Title",
    description: "Primary accolade title displayed in Hero trust badge",
    type: "text",
    group: "Stats",
    placeholder: "AWWWARDS",
  },
  {
    key: "stats_awwwards_subtitle",
    label: "Hero Badge Award Subtitle",
    description: "Secondary recognition line for the award badge",
    type: "text",
    group: "Stats",
    placeholder: "Honorable Member Agency 2026",
  },

  // Hero Section
  {
    key: "hero_badge",
    label: "Hero Top Pill Badge",
    description: "Floating cyan pill label above the main homepage headline",
    type: "text",
    group: "Hero",
    placeholder: "Creative Branding & Digital Agency",
  },
  {
    key: "hero_title_line1",
    label: "Headline Line 1",
    description: "First line of the homepage hero title",
    type: "text",
    group: "Hero",
    placeholder: "Building Brands",
  },
  {
    key: "hero_title_line2",
    label: "Headline Line 2",
    description: "Second line of the hero title before the accent keyword",
    type: "text",
    group: "Hero",
    placeholder: "That Get",
  },
  {
    key: "hero_title_highlight",
    label: "Headline Highlight Word (Cyan Gradient)",
    description: "The prominent glowing cyan keyword (e.g. Noticed.)",
    type: "text",
    group: "Hero",
    placeholder: "Noticed.",
  },
  {
    key: "hero_description",
    label: "Hero Lead Paragraph",
    description: "Primary introductory description below the hero headline",
    type: "textarea",
    group: "Hero",
    placeholder: "We help businesses grow with stunning brand identities...",
  },
  {
    key: "hero_cta_primary",
    label: "Hero Primary Button Text",
    description: "Label for the main contact action button",
    type: "text",
    group: "Hero",
    placeholder: "Start a Project",
  },
  {
    key: "hero_cta_secondary",
    label: "Hero Secondary Button Text",
    description: "Label for portfolio explore link",
    type: "text",
    group: "Hero",
    placeholder: "View our Work",
  },

  // About Section
  {
    key: "about_badge",
    label: "About Section Badge",
    description: "Eyebrow tag label rendered at the top of the About section",
    type: "text",
    group: "About",
    placeholder: "Who We Are",
  },
  {
    key: "about_heading",
    label: "About Section Main Heading",
    description: "Bold title for the agency story section",
    type: "text",
    group: "About",
    placeholder: "Crafting Brands that Connect & Inspire",
  },
  {
    key: "about_story_lead",
    label: "About Narrative Lead",
    description: "Primary agency narrative story paragraph",
    type: "textarea",
    group: "About",
    placeholder: "At BrandHive Studio, we blend design strategy, technology...",
  },
  {
    key: "about_mission",
    label: "Agency Mission Statement",
    description: "Core mission statement highlighted in company story",
    type: "textarea",
    group: "About",
    placeholder: "To elevate how businesses connect with their audiences...",
  },
  {
    key: "about_vision",
    label: "Agency Vision Statement",
    description: "Strategic future vision statement",
    type: "textarea",
    group: "About",
    placeholder: "To become the premier creative partner for industry leaders...",
  },

  // CTA Section
  {
    key: "cta_badge",
    label: "CTA Section Badge",
    description: "Pill badge above the call-to-action headline",
    type: "text",
    group: "CTA",
    placeholder: "READY TO START?",
  },
  {
    key: "cta_heading",
    label: "CTA Main Headline",
    description: "Prominent closing section headline",
    type: "text",
    group: "CTA",
    placeholder: "Let's Build Something Extraordinary.",
  },
  {
    key: "cta_description",
    label: "CTA Description Paragraph",
    description: "Persuasive narrative before the final project kickoff button",
    type: "textarea",
    group: "CTA",
    placeholder: "Whether you're launching a new business, refreshing your brand...",
  },
  {
    key: "cta_button_text",
    label: "CTA Action Button Label",
    description: "Text rendered inside the glowing gradient button",
    type: "text",
    group: "CTA",
    placeholder: "Start a Project",
  },
];

type TabType = "Stats" | "Hero" | "About" | "CTA";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Stats");
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/content");
        if (!res.ok) throw new Error("Failed to load content");
        const data = await res.json();
        if (data.map) {
          setValues(data.map);
          setInitialValues(data.map);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error loading content";
        setFeedback({ type: "error", text: msg });
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setValues(initialValues);
    setFeedback(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);

      // Collect only changed values or all values for the active group
      const updates = Object.entries(values).map(([key, value]) => ({
        key,
        value,
      }));

      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updates }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save content");
      }

      setInitialValues(values);
      setFeedback({ type: "success", text: "Site content updated successfully across the website!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving changes";
      setFeedback({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const currentFields = FIELDS.filter((f) => f.group === activeTab);
  const hasUnsavedChanges = JSON.stringify(values) !== JSON.stringify(initialValues);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Site Content & Dynamic Copy
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#16C7FF]/10 text-[#16C7FF] border border-[#16C7FF]/20">
              Live in Step 11
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl">
            Update key website copy, agency metrics, hero messaging, and mission statements stored in Turso database.
          </p>
        </div>

        {/* Global Save Controls */}
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050608] bg-gradient-to-r from-[#16C7FF] to-[#0096C7] hover:from-[#60D6FF] hover:to-[#16C7FF] transition-all shadow-[0_0_20px_rgba(22,199,255,0.25)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin text-[#050608]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-4 text-[#050608]" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-medium transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Group Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#090C12] border border-white/10">
        <button
          onClick={() => setActiveTab("Stats")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "Stats"
              ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <BarChart3 className="size-4" />
          <span>Key Stats & Counters</span>
        </button>

        <button
          onClick={() => setActiveTab("Hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "Hero"
              ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="size-4" />
          <span>Hero Section</span>
        </button>

        <button
          onClick={() => setActiveTab("About")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "About"
              ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Compass className="size-4" />
          <span>About & Mission</span>
        </button>

        <button
          onClick={() => setActiveTab("CTA")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "CTA"
              ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Megaphone className="size-4" />
          <span>Call To Action (CTA)</span>
        </button>
      </div>

      {/* Main Edit Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090C12] border border-white/10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#16C7FF]/5 blur-[90px] rounded-full pointer-events-none" />

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-white/50">
            <Loader2 className="size-6 animate-spin text-[#16C7FF]" />
            <p className="text-xs">Loading site content from Turso...</p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Live Preview Bar for Stats Tab */}
            {activeTab === "Stats" && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-white/50">
                  Live Counter Preview (As shown on homepage)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#11161C] border border-white/10 text-center">
                    <p className="text-xl sm:text-2xl font-extrabold text-[#16C7FF]">
                      {values["stats_projects_number"] || "50"}{values["stats_projects_suffix"] || "+"}
                    </p>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mt-1">
                      {values["stats_projects_label"] || "Projects Delivered"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#11161C] border border-white/10 text-center">
                    <p className="text-xl sm:text-2xl font-extrabold text-[#16C7FF]">
                      {values["stats_clients_number"] || "25"}{values["stats_clients_suffix"] || "+"}
                    </p>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mt-1">
                      {values["stats_clients_label"] || "Clients Served"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#11161C] border border-white/10 text-center">
                    <p className="text-xl sm:text-2xl font-extrabold text-[#16C7FF]">
                      {values["stats_years_number"] || "2"}{values["stats_years_suffix"] || "+"}
                    </p>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mt-1">
                      {values["stats_years_label"] || "Years Experience"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#11161C] border border-white/10 text-center">
                    <p className="text-xl sm:text-2xl font-extrabold text-[#16C7FF]">
                      {values["stats_satisfaction_number"] || "100"}{values["stats_satisfaction_suffix"] || "%"}
                    </p>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mt-1">
                      {values["stats_satisfaction_label"] || "Client Satisfaction"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Field Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentFields.map((field) => {
                const isWide = field.type === "textarea" || field.key.includes("description") || field.key.includes("mission") || field.key.includes("vision") || field.key.includes("story");
                return (
                  <div
                    key={field.key}
                    className={`space-y-2 ${isWide ? "md:col-span-2" : "col-span-1"}`}
                  >
                    <div className="flex items-baseline justify-between">
                      <label className="text-xs font-semibold text-white tracking-wide">
                        {field.label}
                      </label>
                      <span className="text-[10px] font-mono text-white/40">
                        {field.key}
                      </span>
                    </div>

                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={values[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-[#11161C] border border-white/10 text-white text-xs sm:text-sm focus:border-[#16C7FF]/60 focus:outline-none focus:ring-1 focus:ring-[#16C7FF]/40 transition-colors leading-relaxed placeholder:text-white/20"
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#11161C] border border-white/10 text-white text-xs sm:text-sm focus:border-[#16C7FF]/60 focus:outline-none focus:ring-1 focus:ring-[#16C7FF]/40 transition-colors placeholder:text-white/20"
                      />
                    )}

                    <p className="text-[11px] text-white/45">
                      {field.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Reminder */}
            {hasUnsavedChanges && (
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-amber-400/90 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  You have unsaved changes in this section
                </span>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#050608] bg-[#16C7FF] hover:bg-[#60D6FF] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="size-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
