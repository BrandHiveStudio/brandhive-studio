"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FaqForm from "../FaqForm";
import type { Faq } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditFaqPage() {
  const params = useParams();
  const id = params?.id as string;

  const [faq, setFaq] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchFaq = async () => {
      try {
        const res = await fetch(`/api/admin/faqs/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load FAQ record.");
        }
        const data = await res.json();
        setFaq(data.faq);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching FAQ");
      } finally {
        setLoading(false);
      }
    };

    fetchFaq();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center gap-3">
        <div className="size-8 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
        <p className="text-xs text-white/40">Loading FAQ details...</p>
      </div>
    );
  }

  if (error || !faq) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">FAQ Not Found</h2>
        <p className="text-xs text-white/50">{error || "The requested FAQ item does not exist."}</p>
        <Link
          href="/admin/faqs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all"
        >
          <ArrowLeft className="size-4" />
          <span>Back to FAQs</span>
        </Link>
      </div>
    );
  }

  return <FaqForm initialData={faq} isEdit={true} faqId={id} />;
}
