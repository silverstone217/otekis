-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "material" STRING;
ALTER TABLE "Article" ALTER COLUMN "stock" SET DEFAULT 0;
