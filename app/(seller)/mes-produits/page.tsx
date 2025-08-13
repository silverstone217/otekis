import NoUserComponent from "@/components/NoUserComponent";
import NoShopFind from "@/components/seller/NoShopFind";
import { LinkAddNewProduct } from "@/components/seller/products/ListProductsView";
import MyMainProductsShopsComponent from "@/components/seller/products/MyMainProductsShopsComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { getShopsByUserID } from "@/actions/shopActions";
import React, { Suspense } from "react";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";

const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });

  return products;
};

const MyProductsPage = async () => {
  const user = await getUser();

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
            otekis@gmail.com
          </p>
          <p className=" text-gray-600 px-3 py-1 border-gray-400 bg-black/10 rounded-xl">
            +243-894-785-585
          </p>
        </div>
      </div>
    );
  }

  const shops = await getShopsByUserID(user.id);

  if (!shops || shops.length < 1) {
    return <NoShopFind />;
  }

  const products = await getProducts();
  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  return (
    <div className="w-full flex flex-col transition-all duration-500 ease-in-out">
      <div
        className="w-full flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between 
  transition-all duration-500 ease-in-out"
      >
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl">
            La section de vos produits
          </h2>
          <p className="text-gray-600 lg:text-[17px]">
            {`Pour ajouter, voir, modifier ou et supprimer des produits de votre boutique.`}
          </p>
        </div>
        {/* navigate */}

        <LinkAddNewProduct shops={shops} />
      </div>

      {/* Shops */}
      {/* <AdminsDataTable data={admins} columns={AdminsColumns} /> */}
      <Suspense fallback={<div>loading...</div>}>
        <MyMainProductsShopsComponent
          shops={shops}
          products={products}
          currency={currency}
          exchange={exchange}
        />
      </Suspense>
    </div>
  );
};

export default MyProductsPage;
