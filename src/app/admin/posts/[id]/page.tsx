"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostForm from "../PostForm";
import type { Post } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditPostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/posts/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load article record.");
        }
        const data = await res.json();
        setPost(data.post);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching article");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center gap-3">
        <div className="size-8 border-2 border-[#16C7FF]/20 border-t-[#16C7FF] rounded-full animate-spin" />
        <p className="text-xs text-white/40">Loading article details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Article Not Found</h2>
        <p className="text-xs text-white/50">{error || "The requested article item does not exist."}</p>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Articles</span>
        </Link>
      </div>
    );
  }

  return <PostForm initialData={post} isEdit={true} postId={id} />;
}
