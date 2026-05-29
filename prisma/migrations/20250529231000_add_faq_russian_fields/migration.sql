-- AlterTable: Add Russian translation fields to FAQ
ALTER TABLE "faqs" ADD COLUMN "questionRu" TEXT;
ALTER TABLE "faqs" ADD COLUMN "answerRu" TEXT;
