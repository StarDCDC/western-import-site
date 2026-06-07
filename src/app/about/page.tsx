import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";

// Metadata moved to layout.tsx
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const pageData = await getPageContent("about");
  const title = pageData?.titleRo || "Despre Noi";
  const content = pageData?.contentRo;

  const isBlockContent = content?.trim().startsWith("[");
  const blocks = isBlockContent ? parseBlocks(content ?? null) : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: title }]} />
          <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />

            {isBlockContent && blocks.length > 0 ? (
              <PageBlocks blocks={blocks} />
            ) : content ? (
              <div
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-slate-600 dark:prose-p:text-slate-400
                  prose-a:text-primary hover:prose-a:underline
                  prose-strong:text-slate-800 dark:prose-strong:text-slate-200
                  prose-li:text-slate-600 dark:prose-li:text-slate-400
                  prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-slate-400 italic">Conținutul paginii va fi adăugat în curând.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
