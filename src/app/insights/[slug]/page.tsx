import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient";
import { getPostBySlug } from "@/lib/db/queries/posts";
import { getCurrentAdmin } from "@/lib/auth/session";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const admin = await getCurrentAdmin();
  const allowDraft = Boolean(admin);
  const article = await getPostBySlug(slug, allowDraft);

  if (!article) {
    return {
      title: "Article Not Found | BrandHive Studio",
    };
  }

  return {
    title: `${article.title} | BrandHive Studio Insights`,
    description: article.description,
    openGraph: {
      title: `${article.title} | BrandHive Studio`,
      description: article.description,
      type: "article",
      url: `https://brandhivestudio.com.lk/insights/${article.slug}`,
      images: [
        {
          url: article.image.startsWith("http")
            ? article.image
            : `https://brandhivestudio.com.lk${article.image}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | BrandHive Studio`,
      description: article.description,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const admin = await getCurrentAdmin();
  const allowDraft = Boolean(admin);
  const article = await getPostBySlug(slug, allowDraft);

  if (!article) {
    notFound();
  }

  return <ArticleClient article={article} />;
}
