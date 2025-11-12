/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `DeliveryOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."DeliveryCompany" ADD COLUMN     "paymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'mobile_money';

-- AlterTable
ALTER TABLE "public"."DeliveryOrder" DROP COLUMN "paymentMethod";
