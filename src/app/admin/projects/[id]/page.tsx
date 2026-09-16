"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectForm, { ProjectFormData } from "../ProjectForm";
import { Loader2, AlertCircle } from "lucide-react";

export default function EditProjectPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/admin/projects/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load project details.");
        }
        setProject({
          ...data.project,
          deliverables: data.project.deliverablesList || [],
          images: data.project.images || [],
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error loading project.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 text-[#16C7FF] animate-spin" />
        <span className="text-xs text-white/50">Loading case study data...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-3xl bg-[#090C12] border border-rose-500/20 text-center space-y-4">
        <AlertCircle className="size-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white">Project Not Found</h2>
        <p className="text-xs text-white/50">{error || "The requested project could not be found."}</p>
      </div>
    );
  }

  return <ProjectForm initialData={project} isEdit={true} />;
}
