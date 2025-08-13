/*
  Warnings:

  - You are about to drop the column `clientId` on the `Facture` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `Facture` table. All the data in the column will be lost.
  - The required column `orderId` was added to the `Facture` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Facture" DROP CONSTRAINT "Facture_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Facture" DROP CONSTRAINT "Facture_shopId_fkey";

-- AlterTable
ALTER TABLE "Facture" DROP COLUMN "clientId";
ALTER TABLE "Facture" DROP COLUMN "shopId";
ALTER TABLE "Facture" ADD COLUMN     "orderId" STRING NOT NULL;
ALTER TABLE "Facture" ADD COLUMN     "refundPhoneNumber" STRING;
ALTER TABLE "Facture" ADD COLUMN     "type" STRING NOT NULL DEFAULT 'paiement';
