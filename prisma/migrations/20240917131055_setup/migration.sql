/*
  Warnings:

  - You are about to drop the column `Category` on the `Shop` table. All the data in the column will be lost.
  - Added the required column `category` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "Category";
ALTER TABLE "Shop" ADD COLUMN     "category" STRING NOT NULL;
