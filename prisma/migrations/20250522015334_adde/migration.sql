-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "HistoryOrderId" STRING;

-- CreateTable
CREATE TABLE "HistoryOrders" (
    "id" STRING NOT NULL,
    "commandNumber" STRING NOT NULL DEFAULT 'AI45BC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryOrders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_HistoryOrderId_fkey" FOREIGN KEY ("HistoryOrderId") REFERENCES "HistoryOrders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
