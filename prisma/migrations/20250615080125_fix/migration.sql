/*
  Warnings:

  - You are about to drop the column `address` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `Order` table. All the data in the column will be lost.
  - Added the required column `receiverAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverTel` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "address";
ALTER TABLE "Order" DROP COLUMN "tel";
ALTER TABLE "Order" ADD COLUMN     "receiverAddress" STRING NOT NULL;
ALTER TABLE "Order" ADD COLUMN     "receiverName" STRING NOT NULL;
ALTER TABLE "Order" ADD COLUMN     "receiverTel" STRING NOT NULL;
