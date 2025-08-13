-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "Category" STRING NOT NULL DEFAULT '0';

-- AlterTable
ALTER TABLE "ShopPreferences" ADD COLUMN     "Category" STRING NOT NULL DEFAULT '0';
