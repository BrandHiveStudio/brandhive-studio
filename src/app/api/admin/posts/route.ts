import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAllPosts, createPost } from "@/lib/db/queries/posts";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const items = await getAllPosts({ category, search });

    return NextResponse.json({
      ok: true,
      posts: items,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch posts";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!content || !String(content).trim()) {
      return NextResponse.json({ error: "Article content is required." }, { status: 400 });
    }

    const cleanSlug = slug && String(slug).trim()
      ? String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : String(title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const post = await createPost({
      title: String(title).trim(),
      slug: cleanSlug,
      excerpt: excerpt ? String(excerpt).trim() : null,
      content: String(content).trim(),
      coverImage: coverImage ? String(coverImage).trim() : null,
      category: category ? String(category).trim() : "Branding",
      author: author ? String(author).trim() : "BrandHive Studio",
      readTime: readTime ? String(readTime).trim() : "5 MIN READ",
      tags: typeof tags === "string" ? tags : JSON.stringify(tags || []),
      isFeatured: Boolean(isFeatured),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      displayOrder: Number(displayOrder) || 0,
    });

    return NextResponse.json({
      ok: true,
      post,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
