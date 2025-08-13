-- CreateTable
CREATE TABLE "Product" (
    "id" STRING NOT NULL,
    "uid" STRING NOT NULL,
    "name" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "category" STRING NOT NULL,
    "description" STRING NOT NULL,
    "image" STRING,
    "images" STRING[],
    "price" STRING NOT NULL,
    "state" STRING NOT NULL DEFAULT 'nouveau',
    "quality" STRING NOT NULL DEFAULT 'original',
    "target" STRING,
    "type" STRING,
    "brand" STRING,
    "stock" INT4 NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" STRING NOT NULL,
    "color" STRING,
    "size" STRING,
    "stock" INT4 NOT NULL DEFAULT 1,
    "productId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
