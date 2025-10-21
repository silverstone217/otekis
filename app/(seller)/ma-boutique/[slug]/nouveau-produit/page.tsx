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
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const getProductsByCategory = async (category: string) => {
  const products = await prisma.product.findMany({
    where: { category },
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

const getProductShopsByShopId = async (shopId: string) => {
  const products = await prisma.productShop.findMany({
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

  if (user.isBanned) {
    return (
      <div
        className="w-full min-h-[70dvh] flex flex-col items-center
       justify-center text-center mx-auto max-w-2xl text-pretty"
      >
        <p className="text-xl font-bold">
          Votre compte a été banni. Vous ne pouvez pas accéder à votre espace de
          vendeur actuellement.
        </p>
        <p className="mt-2 text-gray-600">
          {` Veuillez contacter votre administrateur pour plus d'information.`}
        </p>
        <div className="mt-2 text-gray-600 flex gap-4 flex-wrap item-center justify-start text-sm">
          <p className=" text-gray-600 px-3 py-1 border-gray-400 bg-black/10 rounded-xl">
            oteki@gmail.com
          </p>
          <p className=" text-gray-600 px-3 py-1 border-gray-400 bg-black/10 rounded-xl">
            +243-894-785-585
          </p>
        </div>
      </div>
    );
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

  const products = await getProductsByCategory(shop.category);
  const productsShop = await getProductShopsByShopId(shop.id);

  // Récupérer les IDs des produits dans productsShop
  const productIdsInShop = new Set(
    productsShop.map((product) => product.productId)
  );

  // Créer un tableau trié
  const sortedProducts = products.sort((a, b) => {
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
        {/* navigate */}
        {/* <Link
          href={`/produits/${shop.slug}/articles`}
          className="w-full lg:w-fit lg:px-6 py-3 bg-primary text-center text-white font-medium border-2 border-primary 
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out shadow-md
        flex items-center justify-center gap-4
        "
        >
          <Plus className="w-8 flex-shrink-0" />
          <span>Voire les articles</span>
        </Link> */}
      </div>
      {/* List */}
      <ListAddProductsShop
        shop={shop}
        products={sortedProducts}
        productsShop={productsShop}
        currency={currency}
        exchange={exchange}
      />
    </div>
  );
};
export default AddShopProductPage;
