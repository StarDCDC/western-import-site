import prisma from '@/lib/prisma';

export async function getPageContent(slug: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) return null;
  return page;
}
