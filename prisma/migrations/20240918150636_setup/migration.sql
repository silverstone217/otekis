-- CreateTable
CREATE TABLE "Preferences" (
    "id" STRING NOT NULL,
    "shopId" STRING NOT NULL,
    "background" STRING NOT NULL DEFAULT '#ffffff',
    "textColor" STRING NOT NULL DEFAULT '#000000',
    "buttonColor" STRING NOT NULL DEFAULT '#000000',
    "buttonTextColor" STRING NOT NULL DEFAULT '#ffffff',
    "buttonRadius" STRING NOT NULL DEFAULT '4px',
    "hero" STRING NOT NULL DEFAULT 'random',
    "userId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preferences_shopId_key" ON "Preferences"("shopId");

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
