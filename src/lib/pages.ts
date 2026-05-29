import prisma from '@/lib/prisma';

export interface PageData {
  titleRo: string;
  titleRu: string;
  contentRo: string | null;
  contentRu: string | null;
}

/**
 * Fetch page content from DB. Returns null if not found.
 */
export async function getPageContent(slug: string): Promise<PageData | null> {
  try {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) return null;
    return {
      titleRo: page.titleRo,
      titleRu: page.titleRu,
      contentRo: page.contentRo,
      contentRu: page.contentRu,
    };
  } catch {
    return null;
  }
}

/**
 * Get the content for a specific language, falling back to the other language.
 */
export function getLocalizedContent(page: PageData, lang: 'ro' | 'ru') {
  return {
    title: lang === 'ru' ? (page.titleRu || page.titleRo) : page.titleRo,
    content: lang === 'ru' ? (page.contentRu || page.contentRo) : page.contentRo,
  };
}
