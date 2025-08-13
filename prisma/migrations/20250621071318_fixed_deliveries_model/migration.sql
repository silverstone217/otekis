/*
  Warnings:

  - You are about to drop the column `PaymentRef` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DeliveryOrder" ALTER COLUMN "deliveryDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "PaymentRef";
ALTER TABLE "Order" ADD COLUMN     "paymentRef" STRING;
