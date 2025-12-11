import NoUserComponent from "@/components/NoUserComponent";
import NoShopFind from "@/components/seller/NoShopFind";
import { LinkAddNewProduct } from "@/components/seller/products/ListProductsView";
import MyMainProductsShopsComponent from "@/components/seller/products/MyMainProductsShopsComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { getShopsByUserID } from "@/actions/shopActions";
import React, { Suspense } from "react";
import {
  exChangeRate,
  getCompanyPreference,
  getCurrencySymbol,
} from "@/actions/companyAction";
import BannedUserSeller from "@/components/BannedUserSeller";

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
  const otekisPrefs = await getCompanyPreference();

  if (user.isBanned) {
    return <BannedUserSeller otekisPrefs={otekisPrefs} />;
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
      <Suspense fallback={<div>chargement...</div>}>
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
