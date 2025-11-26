import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import MainCatalogueComponent from "@/components/shop/catalogues/MainCatalogueComponent";
import { prisma } from "@/lib/prisma";
import { ProductsTypeWithArticles } from "@/types/shop";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Preferences } from "@prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, ProductShop: true },
  });
  if (!shop) return null;

  return shop;
};
const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  props: Props
): // parent: ResolvingMetadata
Promise<Metadata> {
  const params = await props.params;
  // read route params
  const { slug } = params;

  // fetch data
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return {
      title: "Boutique non trouvée",
      description: "La boutique que vous recherchez n'existe pas.",
    };
  }

  return {
    title: capitalizeText(shop.name) + " - catalogues",
    description: capitalizeText(shop.description),
    openGraph: {
      title: capitalizeText(shop.name) + " - catalogues",
      description: capitalizeText(shop.description),
      images: [shop.logo],
      type: "website",
      url: "https://www.otekis.com/" + shop.slug + "/catalogues",
    },
    icons: {
      icon: shop.logo,
    },
    alternates: {
      canonical: `https://www.otekis.com/${shop.slug}/catalogues`,
    },
  };
}

const CatalogPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const { slug } = params;

  if (!slug) return redirect("/");

  const shop = await getShopBySlug(slug);
  const products = await getProducts();

  if (!shop) return <div>Shop not found</div>;

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const productsShop = shop.ProductShop;

  // filterd by date and article stock
  const filteredProducts = () => {
    const productIdsInShop = productsShop.map((ps) => ps.productId);
    const filtered = products.filter((product) =>
      productIdsInShop.includes(product.id)
    );

    const sortedProductShops = productsShop
      .filter((ps) => productIdsInShop.includes(ps.productId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    // const sortedFilteredProducts = sortedProductShops.map((sortedPS) =>
    //   filtered.find((product) => product.id === sortedPS.productId)
    // );
    function isOutOfStock(product: ProductsTypeWithArticles) {
      if (!product.Article || product.Article.length === 0) return true;
      return product.Article.every((a) => a.stock == null || a.stock <= 0);
    }

    const sortedFilteredProducts = sortedProductShops.map((sortedPS) =>
      filtered.find((product) => product.id === sortedPS.productId)
    );

    // Filtre explicitement les undefined (narrowing TypeScript garanti)
    const definedProducts = sortedFilteredProducts.filter(
      (p): p is ProductsTypeWithArticles => p !== undefined
    );

    return definedProducts.sort((a, b) => {
      const aOut = isOutOfStock(a);
      const bOut = isOutOfStock(b);
      if (aOut === bOut) return 0;
      return aOut ? 1 : -1;
    });
  };

  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  return (
    <div>
      <MainCatalogueComponent
        shop={shop}
        preferences={preferences}
        products={filteredProducts() as ProductsTypeWithArticles[]}
        productsShop={productsShop}
        currency={currency}
        exchange={exchange}
      />
    </div>
  );
};

export default CatalogPage;
