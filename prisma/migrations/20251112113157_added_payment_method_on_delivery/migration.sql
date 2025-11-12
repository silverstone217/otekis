-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('mobile_money', 'cash');

-- AlterTable
ALTER TABLE "public"."DeliveryOrder" ADD COLUMN     "paymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'mobile_money';
