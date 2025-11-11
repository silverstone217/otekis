import { getUser } from "@/actions/actions";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import DeleteProductByStock from "@/components/admins/products/DeleteProductByStock";
// import {
//   ProductDataTable,
//   Productscolumns,
// } from "@/components/admins/products/DisplayProductsTable";
import MainTableProduct from "@/components/admins/products/MainTableProduct";
import PrintProductsBtn from "@/components/admins/products/PrintProductsBtn";
// import NoUserComponent from "@/components/NoUserComponent";
import { prisma } from "@/lib/prisma";
import { PERMITED_ROLES } from "@/utils/dataAdd";
// import { getUser } from "@/utils/actions";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";

const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  const exChaneRateAmount = await exChangeRate();

  const filterdProducts = products.map((product) => {
    return {
      ...product,
      price: product.price * exChaneRateAmount,
    };
  });

  return filterdProducts;
};

const ProductPage = async () => {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const products = await getProducts();
  const currencySymbol = await getCurrencySymbol();

  return (
    <div className="w-full flex flex-col gap-6 transition-all duration-500 ease-in-out">
      <div
        className="w-full flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between 
      transition-all duration-500 ease-in-out"
      >
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl">
            La section des Produits
          </h2>
          <p className="text-gray-600 lg:text-[17px]">
            Pour ajouter, voir, modifier ou supprimer un produit ici.
          </p>
        </div>
        {/* navigate */}
        <Link
          href={"/produits/nouveau-produit"}
          className="w-full lg:w-fit lg:px-4 py-3 bg-primary text-center text-white font-medium border-2 border-primary 
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out shadow-md
        flex items-center justify-center gap-4
        "
        >
          <Plus className="w-8 flex-shrink-0 " />
          <span>Ajouter un nouveau produit</span>
        </Link>
      </div>

      <div
        className="w-full flex item-center justify-start flex-wrap gap-4 mt-4
       transition-all duration-500 ease-in-out md:justify-start"
      >
        {/* Impression par types et categories */}
        <PrintProductsBtn />
        {/* Suppression en dessous de 1 */}
        <DeleteProductByStock products={products} />
      </div>

      {/* products */}
      <Suspense fallback={<p>Chargement...</p>}>
        <MainTableProduct currencySymbol={currencySymbol} products={products} />
      </Suspense>
    </div>
  );
};

export default ProductPage;
