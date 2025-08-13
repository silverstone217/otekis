/*
  Warnings:

  - A unique constraint covering the columns `[commandNumber,articleId]` on the table `HistoryOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HistoryOrder_commandNumber_articleId_key" ON "HistoryOrder"("commandNumber", "articleId");
