/*
  Warnings:

  - You are about to drop the `HistoryOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HistoryOrder" DROP CONSTRAINT "HistoryOrder_articleId_fkey";

-- DropTable
DROP TABLE "HistoryOrder";
