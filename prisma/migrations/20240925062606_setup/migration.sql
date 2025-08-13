/*
  Warnings:

  - You are about to drop the column `material` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "material";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "material" STRING;
