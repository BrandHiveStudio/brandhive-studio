"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LinkForm from "../LinkForm";
import type { ExternalLink as ExternalLinkType } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditLinkPage() {
  const params = useParams();
  const id = params?.id as string;

  const [linkData, setLinkData] = useState<ExternalLinkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchLink = async () => {
      try {
        const res = await fetch(`/api/admin/links/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load external link.");
        }
        const data = await res.json();
        setLinkData(data.link);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching link");
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-24 flex flex-col items-center justify-center gap-3">
        <div className="size-8 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
        <p className="text-xs text-white/40">Loading link record...</p>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">External Link Not Found</h2>
        <p className="text-xs text-white/50">{error || "The requested link does not exist in the database."}</p>
        <Link
          href="/admin/links"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all"
        >
          <ArrowLeft className="size-4" />
          <span>Back to External Links</span>
        </Link>
      </div>
    );
  }

  return <LinkForm initialData={linkData} isEdit={true} linkId={id} />;
}
