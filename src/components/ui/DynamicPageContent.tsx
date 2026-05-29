import prisma from '@/lib/prisma';

interface DynamicPageContentProps {
  slug: string;
  lang: 'ro' | 'ru';
  fallbackTitle?: string;
  children?: React.ReactNode; // fallback content if DB is empty
}

/**
 * Fetches page content from DB and renders it.
 * Falls back to children if no DB content exists.
 */
export default async function DynamicPageContent({ slug, lang, children }: DynamicPageContentProps) {
  let page = null;
  try {
    page = await prisma.page.findUnique({ where: { slug } });
  } catch {
    // DB not available, use fallback
  }

  const title = lang === 'ru' ? (page?.titleRu || page?.titleRo) : page?.titleRo;
  const content = lang === 'ru' ? (page?.contentRu || page?.contentRo) : page?.contentRo;

  if (!page || !content) {
    return <>{children}</>;
  }

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none
        prose-headings:text-slate-900 dark:prose-headings:text-white
        prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-2
        prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-slate-600 dark:prose-p:text-slate-400
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-slate-800 dark:prose-strong:text-slate-200
        prose-li:text-slate-600 dark:prose-li:text-slate-400
        prose-ul:my-2 prose-ol:my-2
        prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
