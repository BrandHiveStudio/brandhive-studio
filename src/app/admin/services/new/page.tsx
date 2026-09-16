import React from "react";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import ServiceForm from "../ServiceForm";

export default function NewServicePage() {
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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Create New Service</h1>
          <p className="text-xs text-white/50">Add a new service offering to BrandHive Studio.</p>
        </div>
      </div>

      <ServiceForm />
    </div>
  );
}
