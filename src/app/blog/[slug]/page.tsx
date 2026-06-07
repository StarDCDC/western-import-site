'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useLanguage } from "@/components/ui/LanguageProvider";

interface BlogPost {
  id: string;
  title: string;
  titleRu: string | null;
  slug: string;
  content: string;
  contentRu: string | null;
  excerpt: string | null;
  excerptRu: string | null;
  image: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { locale } = useLanguage();
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          setPost(json.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const backText = locale === 'ru' ? '← Назад к блогу' : '← Înapoi la blog';
  const notFoundText = locale === 'ru' ? 'Статья не найдена' : 'Articolul nu a fost găsit';
  const notFoundSub = locale === 'ru' ? 'Возможно, она была удалена или перемещена.' : 'Este posibil să fi fost șters sau mutat.';

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
          <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{notFoundText}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{notFoundSub}</p>
            <Link href="/blog" className="text-primary hover:underline font-medium">
              {backText}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: locale === 'ru' ? 'Блог' : 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />

          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-6">
            <ArrowLeft size={14} />
            {locale === 'ru' ? 'Все статьи' : 'Toate articolele'}
          </Link>

          <article>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{(locale === 'ru' && post.titleRu) || post.title}</h1>

            <div className="flex items-center gap-3 mb-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(post.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'ro-RO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {post.image && (
              <img
                src={post.image}
                alt={(locale === 'ru' && post.titleRu) || post.title}
                className="w-full rounded-xl mb-8 max-h-96 object-cover"
              />
            )}

            <div
              className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: (locale === 'ru' && post.contentRu) || post.content }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
