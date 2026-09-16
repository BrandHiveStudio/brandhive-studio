import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getPostById, updatePost, deletePost } from "@/lib/db/queries/posts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await getPostById(id);

    if (!item) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      post: item,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch post";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getPostById(id);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      author,
      readTime,
      tags,
      isFeatured,
      isPublished,
      displayOrder,
    } = body;

    let cleanSlug = existing.slug;
    if (slug && String(slug).trim() && String(slug).trim() !== existing.slug) {
      cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    const updated = await updatePost(id, {
      title: title !== undefined ? String(title).trim() : existing.title,
      slug: cleanSlug,
      excerpt: excerpt !== undefined ? (excerpt ? String(excerpt).trim() : null) : existing.excerpt,
      content: content !== undefined ? String(content).trim() : existing.content,
      coverImage: coverImage !== undefined ? (coverImage ? String(coverImage).trim() : null) : existing.coverImage,
      category: category !== undefined ? String(category).trim() : existing.category,
      author: author !== undefined ? String(author).trim() : existing.author,
      readTime: readTime !== undefined ? String(readTime).trim() : existing.readTime,
      tags: tags !== undefined ? (typeof tags === "string" ? tags : JSON.stringify(tags || [])) : existing.tags,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : existing.isPublished,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
    });

    return NextResponse.json({
      ok: true,
      post: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update post";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getPostById(id);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await deletePost(id);

    return NextResponse.json({
      ok: true,
      message: "Post deleted successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete post";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
