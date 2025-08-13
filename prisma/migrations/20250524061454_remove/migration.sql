-- CreateTable
CREATE TABLE "ShopPreferences" (
    "id" STRING NOT NULL,
    "shopId" STRING NOT NULL,
    "template" STRING NOT NULL DEFAULT '0',
    "background" STRING NOT NULL DEFAULT '#ffffff',
    "textColor" STRING NOT NULL DEFAULT '#000000',
    "buttonColor" STRING NOT NULL DEFAULT '#000000',
    "buttonTextColor" STRING NOT NULL DEFAULT '#ffffff',
    "buttonRadius" STRING NOT NULL DEFAULT '4px',
    "fontFamily" STRING NOT NULL DEFAULT 'Lato',
    "title" STRING NOT NULL DEFAULT 'Bienvenue dans Ma boutique',
    "description" STRING NOT NULL DEFAULT 'Parcourez le catalogue et trouvez ce qui vous fait envie!',
    "logo" STRING NOT NULL DEFAULT 'name',
    "menuIcon" STRING NOT NULL DEFAULT '0',
    "cartIcon" STRING NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopPreferences_shopId_key" ON "ShopPreferences"("shopId");

-- AddForeignKey
ALTER TABLE "ShopPreferences" ADD CONSTRAINT "ShopPreferences_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
