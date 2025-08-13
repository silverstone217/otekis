-- CreateTable
CREATE TABLE "HistoryOrder" (
    "id" STRING NOT NULL,
    "articleId" STRING NOT NULL,
    "commandNumber" STRING NOT NULL DEFAULT 'AI45BC',
    "stock" INT4 NOT NULL DEFAULT 0,
    "productName" STRING NOT NULL DEFAULT 'N/A',
    "productId" STRING NOT NULL DEFAULT 'N/A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HistoryOrder_articleId_key" ON "HistoryOrder"("articleId");
