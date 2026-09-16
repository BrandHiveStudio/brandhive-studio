"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProcessForm from "../ProcessForm";
import type { ProcessStep } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProcessStepPage() {
  const params = useParams();
  const id = params?.id as string;

  const [stepData, setStepData] = useState<ProcessStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchStep = async () => {
      try {
        const res = await fetch(`/api/admin/process/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load process step.");
        }
        const data = await res.json();
        setStepData(data.step);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching process step");
      } finally {
        setLoading(false);
      }
    };

    fetchStep();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center gap-3">
        <div className="size-8 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
        <p className="text-xs text-white/40">Loading workflow stage...</p>
      </div>
    );
  }

  if (error || !stepData) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Workflow Stage Not Found</h2>
        <p className="text-xs text-white/50">{error || "The requested stage does not exist in the database."}</p>
        <Link
          href="/admin/process"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Process Stages</span>
        </Link>
      </div>
    );
  }

  return <ProcessForm initialData={stepData} isEdit={true} stepId={id} />;
}
