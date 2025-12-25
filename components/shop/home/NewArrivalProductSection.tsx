"use client";
import { ProductWithArticle } from "@/types/data";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnFormatedMoney,
} from "@/utils/functions";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import {
  Article,
  Preferences,
  ProductShop,
  Shop,
} from "@/lib/generated/prisma/client";
import { MoveRight, ShoppingBag, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

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
          <MoveRight className="w-8 shrink-0" />
        </Link>
      </div>
      {/* maps grid */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 gap-y-4 lg:gap-y-8 lg:gap-8">
        {products.slice(0, 6).map((product) => (
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
  // --- TES FONCTIONS ET CALCULS (INCHANGÉS) ---
  const benefit = useMemo(
    () => (productShopPrice ? productShopPrice - (product.price ?? 0) : 0),
    [product.price, productShopPrice]
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

  const LUMINANCE = luminanceColor(preferences.buttonColor);
  const bgImage = useMemo(
    () =>
      LUMINANCE !== "dark"
        ? "rgba(0, 0, 0, 0.05)"
        : "rgba(256, 256, 256, 0.05)",
    [LUMINANCE]
  );

  const isPromo =
    productShopPromotion &&
    productShopPromotion > 0 &&
    productShopPrice * exchange !== totalPriceAfterDiscount * exchange;

  return (
    <Link
      href={`/${shop.slug}/catalogues/${product.id}`}
      className="group flex flex-col w-full h-full transition-all duration-500 
      ease-in-out"
    >
      {/* CONTENEUR IMAGE */}
      <div
        className="relative  w-full overflow-hidden shadow-sm border 
        border-black/3 "
        style={{
          backgroundColor: bgImage,
          borderRadius: preferences.buttonRadius,
          aspectRatio: "3 / 4",
        }}
      >
        {/* L'image avec zoom plus fluide */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority
          className="object-cover transition-transform duration-700 
          ease-out group-hover:scale-110 "
          unoptimized
        />

        {/* Overlay au survol */}
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/10 
        transition-colors duration-500"
        />

        {/* BADGE PROMO AMÉLIORÉ */}
        {/* On vérifie que isPromo est vrai ET que le pourcentage est strictement supérieur à 0 */}
        {Boolean(isPromo) && discountPercentage > 0 && (
          <div
            className="absolute top-3 left-3 z-10 px-2.5 py-1 flex items-center gap-1 shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: preferences.buttonColor,
              color: preferences.buttonTextColor,
              borderRadius: `calc(${preferences.buttonRadius} / 2)`,
            }}
          >
            <Sparkles size={10} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* BOUTON "VUE RAPIDE" QUI APPARAÎT AU HOVER (Mobile-friendly) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[85%] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <div
            className="py-2.5 text-center text-[10px] font-bold uppercase tracking-widest shadow-xl"
            style={{
              backgroundColor: preferences.buttonColor,
              color: preferences.buttonTextColor,
              borderRadius: preferences.buttonRadius,
            }}
          >
            Voir les détails
          </div>
        </div>
      </div>

      {/* SECTION INFOS */}
      <div className="mt-4 flex flex-col gap-1.5 px-1">
        {/* Type ou Catégorie (petit texte discret) */}
        <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
          {product.type || "Collection"}
        </span>

        <h3 className="text-sm md:text-base font-bold tracking-tight line-clamp-1 group-hover:underline transition-all underline-offset-4">
          {capitalizeText(product.name)}
        </h3>

        {/* PRIX ET STOCK */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            {isPromo && discountPercentage > 0 ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-black tracking-tight"
                  style={{ color: preferences.buttonColor }}
                >
                  {returnFormatedMoney(totalPriceAfterDiscount * exchange)}
                  <small className="ml-0.5 text-[10px]">{currency}</small>
                </span>
                <s className="text-[9px] opacity-30 italic">
                  {returnFormatedMoney(productShopPrice * exchange)} {currency}
                </s>
              </div>
            ) : (
              <span className="text-sm font-black tracking-tight">
                {returnFormatedMoney(productShopPrice * exchange)}
                <small className="ml-0.5 text-[10px]">{currency}</small>
              </span>
            )}

            {/* Icone panier discrète */}
            <div className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5">
              <ShoppingBag size={14} className="opacity-60" />
            </div>
          </div>

          {/* STOCK STATUS */}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                totalQuantity > 5
                  ? "bg-green-500"
                  : totalQuantity > 0
                    ? "bg-orange-500"
                    : "bg-red-500"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium tracking-tight",
                totalQuantity === 0 ? "text-red-500 opacity-100" : "opacity-50"
              )}
            >
              {totalQuantity > 0
                ? `${totalQuantity.toString().padStart(2, "0")} exemplaires disponibles`
                : "Rupture de stock"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
