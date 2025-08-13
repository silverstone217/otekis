"use client";
import {
  Article,
  Preferences,
  Product,
  ProductShop,
  Shop,
} from "@prisma/client";
import React from "react";
import { ProductCard } from "../home/NewArrivalProductSection";
import { ProductsTypeWithArticles } from "@/types/shop";

type ProductWithArticle = Product & {
  Article: Article[];
};
type Props = {
  products: ProductWithArticle[];
  product: ProductWithArticle;
  shop: Shop;
  preferences: Preferences;
  productsShop: ProductShop[];
  currency: "$" | "CDF";
  exchange: number;
};

const SimilarProductsComponent = ({
  products,
  shop,
  preferences,
  productsShop,
  product,
  currency,
  exchange,
}: Props) => {
  const uniqueProducts = products.filter((p) => p.id !== product.id);

  const similarProducts = uniqueProducts.map((prod) => {
    let score = 0;
    if (
      prod.name.includes(product.name) ||
      prod.description
        .trim()
        .toLocaleLowerCase()
        .includes(product.description.trim().toLowerCase())
    ) {
      score += 1;
    }
    if (prod.brand === product.brand) {
      score += 2;
    }
    if (prod.type && product.type && prod.type.includes(product.type)) {
      score += 3;
    }
    if (prod.target && product.target) {
      if (
        (prod.target === "woman" && product.target === "woman") ||
        (prod.target === "men" && product.target === "men") ||
        (prod.target === "unisex" && product.target === "unisex") ||
        (prod.target === "unisex" && product.target === "men") ||
        (prod.target === "unisex" && product.target === "woman") ||
        prod.target === product.target
      ) {
        score += 2;
      }
    }
    if (prod.quality && product.quality) {
      if (prod.quality.includes(product.quality)) {
        score += 1;
      }
    }
    if (prod.state && product.state) {
      if (prod.state.includes(product.state)) {
        score += 1;
      }
    }

    return {
      ...prod,
      score,
    };
  });

  if (similarProducts.length < 1) return null;

  // const sortedSimilarProducts = similarProducts.sort(
  //   (a, b) => b.score - a.score
  // );

  const filteredProducts = () => {
    const sortedSimilarProducts = similarProducts.sort(
      (a, b) => b.score - a.score
    );

    // const sortedFilteredProducts = sortedProductShops.map((sortedPS) =>
    //   filtered.find((product) => product.id === sortedPS.productId)
    // );
    function isOutOfStock(product: ProductsTypeWithArticles) {
      if (!product.Article || product.Article.length === 0) return true;
      return product.Article.every((a) => a.stock == null || a.stock <= 0);
    }

    // Filtre explicitement les undefined (narrowing TypeScript garanti)
    const definedProducts = sortedSimilarProducts.filter(
      (p): p is ProductsTypeWithArticles & { score: number } => p !== undefined
    );

    return definedProducts.sort((a, b) => {
      const aOut = isOutOfStock(a);
      const bOut = isOutOfStock(b);
      if (aOut === bOut) return 0;
      return aOut ? 1 : -1;
    });
  };

  return (
    <div className="w-full flex flex-col gap-10 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold">Produits similaires</h2>
        <p className="text-sm opacity-75 font-medium">
          Une liste de produits qui pourrait vous plaire.
        </p>
      </div>

      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4 lg:gap-y-8 lg:gap-8">
        {filteredProducts()
          .slice(0, 8)
          .map((similarProduct) => (
            <ProductCard
              key={similarProduct.id}
              product={similarProduct}
              shop={shop}
              preferences={preferences}
              productShopPrice={
                productsShop.find((pr) => similarProduct.id === pr.productId)
                  ?.price
              }
              productShopPercentage={
                productsShop.find((pr) => similarProduct.id === pr.productId)
                  ?.percentage
              }
              productShopPromotion={
                productsShop.find((pr) => similarProduct.id === pr.productId)
                  ?.promotion ?? 0
              }
              currency={currency}
              exchange={exchange}
            />
          ))}
      </div>
    </div>
  );
};

export default SimilarProductsComponent;
