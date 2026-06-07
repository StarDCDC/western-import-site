'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useLanguage } from "@/components/ui/LanguageProvider";

interface BlogPost {
  id: string;
  title: string;
  titleRu: string | null;
  slug: string;
  excerpt: string | null;
  excerptRu: string | null;
  image: string | null;
  isPublished: boolean;
  createdAt: string;
  content: string;
  contentRu: string | null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLanguage();

  useEffect(() => {
    fetch("/api/blog?limit=20")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPosts(json.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const title = locale === 'ru' ? 'Блог' : 'Blog';
  const subtitle = locale === 'ru'
    ? 'Гиды, советы и новости из мира технологий.'
    : 'Ghiduri, sfaturi și noutăți din lumea tehnologiei.';
  const noPosts = locale === 'ru'
    ? 'Пока нет опубликованных статей.'
    : 'Momentan nu sunt articole publicate.';
  const noPostsSub = locale === 'ru' ? 'Возвращайтесь скоро!' : 'Reveniți curând!';
  const readMore = locale === 'ru' ? 'Читать' : 'Citește';

  const categoryEmoji = (index: number) => {
    const emojis = ["💻", "📱", "🏆", "🎯", "💡", "📊"];
    return emojis[index % emojis.length];
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: locale === 'ru' ? 'Блог' : 'Blog' }]} />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">{noPosts}</p>
              <p className="text-sm mt-2">{noPostsSub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((article, i) => (
                <article
                  key={article.id}
                  className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-blue-500/10 dark:from-primary/10 dark:to-blue-500/5 flex items-center justify-center">
                    {article.image ? (
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">{categoryEmoji(i)}</span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'ro-RO')}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {(locale === 'ru' && article.titleRu) || article.title}
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {(locale === 'ru' && article.excerptRu) || article.excerpt || (locale === 'ru' && article.contentRu ? article.contentRu.slice(0, 150) + '...' : article.content.slice(0, 150) + '...')}
                    </p>

                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      {readMore} <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}