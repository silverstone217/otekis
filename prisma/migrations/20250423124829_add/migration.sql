-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "commandNumber" STRING NOT NULL DEFAULT 'AI45BC';

-- CreateTable
CREATE TABLE "DeletedProduct" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedProduct_pkey" PRIMARY KEY ("id")
);
