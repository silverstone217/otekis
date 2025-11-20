-- CreateTable
CREATE TABLE "public"."OtekisDelPriceWithdrawalHistory" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchange" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'non-traité',
    "paymentPhone" TEXT,
    "paymentName" TEXT,
    "transfertID" TEXT,
    "bankNumber" TEXT,

    CONSTRAINT "OtekisDelPriceWithdrawalHistory_pkey" PRIMARY KEY ("id")
);
