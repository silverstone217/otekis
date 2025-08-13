/*
  Warnings:

  - You are about to drop the column `HistoryOrderId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the `HistoryOrders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_HistoryOrderId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "HistoryOrderId";

-- DropTable
DROP TABLE "HistoryOrders";

-- CreateTable
CREATE TABLE "HistoryOrder" (
    "id" STRING NOT NULL,
    "articleId" STRING NOT NULL,
    "commandNumber" STRING NOT NULL DEFAULT 'AI45BC',
    "stock" INT4 NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoryOrder" ADD CONSTRAINT "HistoryOrder_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
