-- CreateTable
CREATE TABLE "DeliveryOrder" (
    "id" STRING NOT NULL,
    "status" STRING NOT NULL DEFAULT 'en attente de livraison',
    "orderId" STRING NOT NULL,
    "deliveryId" STRING,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryPrice" INT4 NOT NULL DEFAULT 0,
    "clientId" STRING NOT NULL,
    "deliveryAddress" STRING NOT NULL,
    "receiverTel" STRING NOT NULL,
    "receiverName" STRING NOT NULL,
    "description" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAgent" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "phone" STRING NOT NULL,
    "address" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryAgent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOrder_orderId_key" ON "DeliveryOrder"("orderId");

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "DeliveryAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
