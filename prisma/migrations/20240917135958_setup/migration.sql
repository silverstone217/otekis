/*
  Warnings:

  - Made the column `logo` on table `Shop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "logo" SET NOT NULL;
