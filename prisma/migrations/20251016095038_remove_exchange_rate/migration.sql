-- AlterTable
ALTER TABLE "public"."DeliveryOrder" ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Facture" ALTER COLUMN "cinetPayPercentage" DROP DEFAULT,
ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."FactureDeliverOrder" ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."OtekisPreferences" ALTER COLUMN "exchangeRate" SET DEFAULT 2300;

-- AlterTable
ALTER TABLE "public"."OtekisProfitWaited" ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."OtekisWithdrawalHistory" ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."ProductFacture" ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."ShopProfitWaited" ALTER COLUMN "exchange" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."WithdrawalHistory" ALTER COLUMN "exchange" DROP DEFAULT;
