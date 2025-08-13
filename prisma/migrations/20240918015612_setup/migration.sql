/*
  Warnings:

  - A unique constraint covering the columns `[productId,shopId]` on the table `ProductShop` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductShop_productId_shopId_key" ON "ProductShop"("productId", "shopId");
