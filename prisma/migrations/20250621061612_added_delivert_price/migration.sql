-- AlterTable
ALTER TABLE "Facture" ADD COLUMN     "deliveryPrice" INT4 NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryPrice" INT4 NOT NULL DEFAULT 0;
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'en attente de paiement';
