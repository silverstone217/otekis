"use client";
import { ProductWithArticle } from "@/types/data";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnFormatedMoney,
} from "@/utils/functions";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import { Article, Preferences, ProductShop, Shop } from "@prisma/client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

type Props = {
  products: ProductWithArticle[];
  shop: Shop;
  preferences: Preferences;
  productsShop: ProductShop[];
  currency: "$" | "CDF";
  exchange: number;
};

const NewArrivalProductSection = ({
  shop,
  products,
  preferences,
  productsShop,
  exchange,
  currency,
}: Props) => {
  return (
    <div className="px-2 lg:px-8 w-full max-w-7xl mx-auto flex flex-col gap-6">
      <div className="px-2 flex w-full items-center justify-between ">
        <h2 className="text-2xl font-black">Nouveautés</h2>
        <Link
          href={`/${shop.slug}/catalogues`}
          className="flex gap-2 item-center hover:gap-6 transition-all duration-500 ease-in-out"
        >
          <span className="text-sm opacity-75">Tout voire</span>
          <MoveRight className="w-8 flex-shrink-0" />
        </Link>
      </div>
      {/* maps grid */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4 lg:gap-y-8 lg:gap-8">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            shop={shop}
            preferences={preferences}
            productShopPrice={
              productsShop.find((pr) => product.id === pr.productId)?.price
            }
            productShopPercentage={
              productsShop.find((pr) => product.id === pr.productId)?.percentage
            }
            productShopPromotion={
              productsShop.find((pr) => product.id === pr.productId)
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

export default NewArrivalProductSection;

// Product Shop Card
export const ProductCard = ({
  product,
  shop,
  preferences,
  productShopPrice = 0,
  productShopPercentage,
  productShopPromotion,
  currency,
  exchange,
}: {
  product: ProductWithArticle;
  shop: Shop;
  preferences: Preferences;
  productShopPrice: number | undefined;
  productShopPercentage: number | undefined;
  productShopPromotion: number | undefined;
  currency: "$" | "CDF";
  exchange: number;
}) => {
  // benefit
  const benefit = useMemo(
    () =>
      product.price > 0
        ? Number(Math.round((productShopPercentage! * product.price) / 100))
        : 0,
    [product.price, productShopPercentage]
  );

  const beneficeAfterDiscount = useMemo(
    () =>
      benefit > 0 ? applyPromotionOnProfit(benefit!, productShopPromotion!) : 0,
    [benefit, productShopPromotion]
  );

  const totalPriceAfterDiscount = useMemo(
    () =>
      beneficeAfterDiscount > 0 ? product.price + beneficeAfterDiscount : 0,
    [product.price, beneficeAfterDiscount]
  );

  const discountPercentage = useMemo(
    () =>
      product.price > 0
        ? calculateDiscountPercentage(
            productShopPrice!,
            totalPriceAfterDiscount
          )
        : 0,
    [productShopPrice, totalPriceAfterDiscount, product.price]
  );

  const articles = product.Article;
  const totalQuantity = articles.reduce((acc: number, article: Article) => {
    return acc + article.stock;
  }, 0);

  // if (!productShopPrice) return null;

  // LUMINANCE
  const LUMINANCE = luminanceColor(preferences.buttonColor);

  const bgImage = useMemo(
    () =>
      LUMINANCE !== "dark" ? "rgba(0, 0, 0, 0.1)" : "rgba(256, 256, 256, 0.1)",
    [LUMINANCE]
  );

  return (
    <Link
      href={`/${shop.slug}/catalogues/${product.id}`}
      className="flex flex-col gap-4 w-full group"
      style={{
        borderRadius: preferences.buttonRadius,
      }}
    >
      <div
        className=" h-54 sm:h-72 w-full overflow-hidden relative
            transition-all duration-500 ease-in-out group-hover:brightness-75
            "
        style={{
          backgroundColor: bgImage,
          borderRadius: preferences.buttonRadius,
        }}
      >
        <Image
          src={product.image}
          alt="Product Image"
          width={1500}
          height={1500}
          priority
          className="object-contain h-full w-full group-hover:scale-110
            transition-all duration-500 ease-in-out group-hover:brightness-75
            "
          style={{
            borderRadius: preferences.buttonRadius,
          }}
          unoptimized
        />

        {productShopPromotion &&
          productShopPromotion > 0 &&
          productShopPrice * exchange !==
            totalPriceAfterDiscount * exchange && (
            <span
              className="absolute top-3 left-2 px-3 py-1 bg-black/20 text-xs
          transition-all duration-500 ease-in-out
          "
              style={{
                borderRadius: preferences.buttonRadius,
              }}
            >
              <strong>{discountPercentage}%</strong> de reduction
            </span>
          )}
      </div>
      {/* info */}
      <div className="w-full flex flex-col items-start justify-start gap-1 text-sm">
        <h3 className="line-clamp-1 font-black">
          {capitalizeText(product.name)}
        </h3>
        {/* {product.brand ? (
          <span className="line-clamp-1 opacity-70">
            {capitalizeText(product.brand)}
          </span>
        ) : (
          <span className="line-clamp-1 opacity-70">
            {product.type &&
              capitalizeText(returnDataValue(product.type, TypeClothesData))}
          </span>
        )} */}
        <div
          className="w-full flex item-center justify-between"
          style={
            {
              // color: preferences.buttonColor,
            }
          }
        >
          {productShopPromotion &&
          productShopPromotion > 0 &&
          productShopPrice * exchange !== totalPriceAfterDiscount * exchange ? (
            <div className="w-full flex item-center justify-between">
              <span className="line-clamp-1 font-bold">
                {returnFormatedMoney(totalPriceAfterDiscount * exchange)}{" "}
                <span className="text-xs">{currency}</span>
              </span>
              <span className="line-clamp-1 opacity-75">
                <s>{returnFormatedMoney(productShopPrice * exchange)}</s>{" "}
                <span className="text-xs">{currency}</span>
              </span>
            </div>
          ) : (
            <span className="line-clamp-1 font-bold ">
              {returnFormatedMoney(productShopPrice * exchange)}{" "}
              <span className="text-xs">{currency}</span>
            </span>
          )}
          {/* <span className="line-clamp-1 font-SemiBold">
            {totalQuantity.toString().padStart(2, "0")}{" "}
            <span className="text-xs">/stock</span>
          </span> */}
        </div>
        <div className="w-full flex item-center justify-between">
          <span className="line-clamp-1 font-medium">
            {totalQuantity > 0 ? (
              <span className="text-xs">
                {totalQuantity > 1
                  ? totalQuantity.toString().padStart(2, "0") + " disponibles"
                  : totalQuantity.toString().padStart(2, "0") +
                    "disponible"}{" "}
              </span>
            ) : (
              <span className="text-xs text-red-800">
                Produit indisponible.
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
};
