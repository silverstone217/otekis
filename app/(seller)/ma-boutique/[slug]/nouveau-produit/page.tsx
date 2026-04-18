import NoUserComponent from "@/components/NoUserComponent";
import ListAddProductsShop from "@/components/seller/products/ListAddProductsShop";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { CategoriesData } from "@/utils/data";
import { returnDataValue } from "@/utils/functions";
import { getShopBySlug } from "@/actions/shopActions";
import { capitalizeText } from "@/utils/shopFunctions";
import { redirect } from "next/navigation";
import React from "react";
import {
  exChangeRate,
  getCompanyPreference,
  getCurrencySymbol,
} from "@/actions/companyAction";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import BannedUserSeller from "@/components/BannedUserSeller";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// OTEKIS PRODUCTS
const getProductsByCategory = async (category: string) => {
  const products = await prisma.product.findMany({
    // where: { category },
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  return products ? products : [];
};
// OTEKIS PRODUCTSHOP PRODUCTS
const getProductShopsByShopId = async (shopId: string) => {
  const products = await prisma.productShop.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

// Suplier PRODUCTS
const getSupplierProductsForShop = async ({
  shopId,
  userId,
}: {
  shopId: string;
  userId: string;
}) => {
  return await prisma.supplierProduct.findMany({
    where: {
      OR: [
        { isAvailable: "for_all" },

        {
          isAvailable: "only_self",
          supplierId: userId,
        },

        {
          isAvailable: "specific_sellers",
          permittedShops: {
            some: {
              shopId: shopId,
            },
          },
        },
      ],
    },
    include: {
      Article: true,
      permittedShops: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
// Suplier PRODUCTSHOP PRODUCTS
const getSuplierProductShopsByShopId = async (shopId: string) => {
  const products = await prisma.supplierProductShop.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

const AddShopProductPage = async (props: Props) => {
  const params = await props.params;
  const user = await getUser();
  const { slug } = params;

  if (!user) {
    return <NoUserComponent />;
  }

  const otekisPrefs = await getCompanyPreference();

  if (user.isBanned) {
    return <BannedUserSeller otekisPrefs={otekisPrefs} />;
  }
  if (!slug) {
    return redirect("/ma-boutique");
  }

  // Get shop by slug and render details
  const shop = await getShopBySlug(slug);
  if (!shop) {
    return <div>pas de boutique trouvée.</div>;
  }

  if (shop.userId !== user.id) {
    return <NotAuthorizedComponent />;
  }

  // OTEKIS
  const products = await getProductsByCategory(shop.category);
  const productsShop = await getProductShopsByShopId(shop.id);

  // SUPPLIER
  const supplierProducts = await getSupplierProductsForShop({
    shopId: shop.id,
    userId: user.id,
  });
  const supplierProductsShop = await getSuplierProductShopsByShopId(shop.id);

  // Récupérer les IDs des produits dans productsShop
  const productIdsInShop = new Set(
    [...productsShop, ...supplierProductsShop].map(
      (product) => product.productId,
    ),
  );

  // Créer un tableau trié
  const sortedProducts = [...products, ...supplierProducts].sort((a, b) => {
    const isAInShop = productIdsInShop.has(a.id);
    const isBInShop = productIdsInShop.has(b.id);

    // Si A n'est pas dans le shop et B est, A vient en premier
    if (!isAInShop && isBInShop) return -1;
    // Si B n'est pas dans le shop et A est, B vient en premier
    if (isAInShop && !isBInShop) return 1;

    // Si les deux sont dans le shop ou hors du shop, on garde l'ordre original
    return 0;
  });

  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  // console.log(sortedProducts);

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out box-border">
      <div className="flex w-full items-start justify-between gap-y-4 lg:flex-row flex-col">
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl mb-2">
            Catalogue de produits à ajouter
          </h2>
          <p className="text-gray-600 lg:text-[17px]">
            ID : <strong>{shop.id}</strong>
          </p>
          <p className="text-gray-600 lg:text-[17px]">
            Boutique : <strong>{capitalizeText(shop.name)}</strong>
          </p>
          <p className="text-gray-600 lg:text-[17px]">
            Category :{" "}
            <strong>{returnDataValue(shop.category, CategoriesData)}</strong>
          </p>
          <p className="text-gray-600">
            ajouté le{" "}
            {new Date(shop.createdAt).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-600 lg:text-[17px] mt-4">
            Selectionner les produits à ajouter a votre bouttique. en cliquant
            sur les <strong>3 points</strong> au dessus.
          </p>
        </div>
        {/* add items */}
      </div>
      {/* List */}
      <ListAddProductsShop
        shop={shop}
        products={sortedProducts}
        productsShop={[...productsShop, ...supplierProductsShop]}
        currency={currency}
        exchange={exchange}
      />
    </div>
  );
};
export default AddShopProductPage;
