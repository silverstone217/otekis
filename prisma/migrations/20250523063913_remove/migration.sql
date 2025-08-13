-- DropForeignKey
ALTER TABLE "HistoryOrder" DROP CONSTRAINT "HistoryOrder_articleId_fkey";

-- AlterTable
ALTER TABLE "HistoryOrder" ALTER COLUMN "articleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HistoryOrder" ADD CONSTRAINT "HistoryOrder_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
