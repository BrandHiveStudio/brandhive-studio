"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Loader2 } from "lucide-react";
import ServiceForm, { ServiceFormData } from "../ServiceForm";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<ServiceFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/services/${id}`);
        const data = await res.json();
        if (data.ok && data.service) {
          const s = data.service;
          setService({
            id: s.id,
            title: s.title,
            slug: s.slug,
            badge: s.badge || "",
            shortDescription: s.shortDescription || "",
            description: s.description,
            imageUrl: s.imageUrl || "",
            features: s.featuresList || [],
            tags: s.tagsList || [],
            displayOrder: s.displayOrder || 0,
            isPublished: Boolean(s.isPublished),
          });
        } else {
          setError(data.error || "Service not found.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center">
        <Loader2 className="size-8 text-[#16C7FF] animate-spin mb-4" />
        <p className="text-xs text-white/50">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-12 rounded-3xl bg-[#090C12] border border-white/10 text-center space-y-4">
        <p className="text-rose-400 text-sm font-semibold">{error || "Service could not be found."}</p>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Services</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-[#16C7FF]/10 border border-[#16C7FF]/20 flex items-center justify-center text-[#16C7FF]">
          <Layers className="size-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Service</h1>
          <p className="text-xs text-white/50 font-mono">{service.title}</p>
        </div>
      </div>

      <ServiceForm initialData={service} isEditing={true} />
    </div>
  );
}
