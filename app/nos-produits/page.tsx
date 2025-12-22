import { getProductsWithArticles } from "@/actions/actions";
import { getCompanyPreference } from "@/actions/companyAction";
import ProductHeader from "@/components/productPage/ProductHeader";
import ProductGallery from "@/components/productPage/productsComponants";
import React from "react";

async function page() {
  const products = await getProductsWithArticles();
  const filterdeProducts = !products
    ? []
    : products.filter((itm) => !itm.name.toLocaleLowerCase().includes("test"));
  const prefs = await getCompanyPreference();

  if (!prefs) return null;

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-neutral-950">
      <ProductHeader />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <ProductGallery initialProducts={filterdeProducts} prefs={prefs} />
      </div>
    </main>
  );
}
export default page;
