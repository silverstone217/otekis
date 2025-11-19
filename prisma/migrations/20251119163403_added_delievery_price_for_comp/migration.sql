-- AlterTable
ALTER TABLE "public"."OtekisBenefitAmount" ADD COLUMN     "deliveryPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryPriceCDF" DOUBLE PRECISION NOT NULL DEFAULT 0;
