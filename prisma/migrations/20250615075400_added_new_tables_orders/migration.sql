-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" STRING;

-- CreateTable
CREATE TABLE "Order" (
    "id" STRING NOT NULL,
    "clientId" STRING NOT NULL,
    "shopId" STRING NOT NULL,
    "status" STRING NOT NULL DEFAULT 'en cours de traitement',
    "totalAmount" INT4 NOT NULL,
    "ValidationCode" STRING,
    "ShipmentNumber" STRING,
    "PaymentRef" STRING,
    "paymentMethod" STRING NOT NULL DEFAULT 'cinetpay',
    "paymentStatus" STRING NOT NULL DEFAULT 'en attente',
    "address" STRING NOT NULL,
    "tel" STRING NOT NULL,
    "description" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" STRING NOT NULL,
    "orderId" STRING NOT NULL,
    "articleId" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "price" INT4 NOT NULL,
    "discount" INT4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" STRING NOT NULL,
    "clientId" STRING NOT NULL,
    "shopId" STRING NOT NULL,
    "paymentMethod" STRING NOT NULL DEFAULT 'cinetpay',
    "status" STRING NOT NULL DEFAULT 'en attente',
    "PaymentRef" STRING NOT NULL,
    "totalAmount" INT4 NOT NULL,
    "address" STRING,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFacture" (
    "id" STRING NOT NULL,
    "factureId" STRING NOT NULL,
    "productName" STRING NOT NULL,
    "productInfo" STRING,
    "quantity" INT4 NOT NULL,
    "price" INT4 NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFacture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFacture" ADD CONSTRAINT "ProductFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
