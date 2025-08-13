-- CreateTable
CREATE TABLE "ProductShop" (
    "id" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "shopId" STRING NOT NULL,
    "percentage" INT4 NOT NULL,
    "price" INT4 NOT NULL,
    "promotion" INT4,
    "promotionName" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductShop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductShop" ADD CONSTRAINT "ProductShop_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductShop" ADD CONSTRAINT "ProductShop_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
