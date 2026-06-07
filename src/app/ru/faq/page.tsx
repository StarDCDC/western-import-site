import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";
import FAQRuContent from "./FAQContent";

export const dynamic = "force-dynamic";

export default async function FAQRuPage() {
  const pageData = await getPageContent("faq");

  if (pageData?.contentRu) {
    const content = pageData.contentRu;
    const isBlockContent = content.trim().startsWith("[");
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-[var(--color-dark-bg)]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Часто задаваемые вопросы" }]} />
            <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Часто задаваемые вопросы</h1>
              <div className="w-16 h-1 bg-primary rounded-full mb-8" />
              {isBlockContent ? (
                <PageBlocks blocks={blocks} />
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <FAQRuContent />
      <Footer />
    </>
  );
}
