-- AlterTable: Add Russian translation fields to blog_posts
ALTER TABLE "blog_posts" ADD COLUMN "titleRu" TEXT;
ALTER TABLE "blog_posts" ADD COLUMN "contentRu" TEXT;
ALTER TABLE "blog_posts" ADD COLUMN "excerptRu" TEXT;
