"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import {
  Product,
  ProductShop,
  Shop,
  Preferences,
} from "@/lib/generated/prisma/client";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnFormatedMoney,
} from "@/utils/functions";
import { ArrowRight, ShoppingCart } from "lucide-react";

export type ShopHeroType = {
  shop: Shop;
  preferences: Preferences;
  getMyFont: NextFontWithVariable;
  products: Product[];
  productsShop: ProductShop[];
  currency: "$" | "CDF";
  exchange: number;
};

const ShopHero = ({
  shop,
  preferences,
  products,
  productsShop,
  exchange,
  currency,
}: ShopHeroType) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // Shuffle products
  const shuffleArray = (array: Product[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const filteredProducts = useMemo(() => shuffleArray(products), [products]);

  // Take 4 products with infos
  const itemsSlides = useMemo(
    () =>
      filteredProducts
        .map((item) => {
          const productShopItem =
            productsShop.find((pr) => pr.productId === item.id) ?? null;
          const benefitItem = productShopItem
            ? Math.round((productShopItem.percentage * item.price) / 100)
            : 0;
          const beneficeAfterDiscountItem = productShopItem?.promotion
            ? applyPromotionOnProfit(benefitItem, productShopItem.promotion)
            : benefitItem;
          const totalPriceAfterDiscountItem = productShopItem
            ? item.price + beneficeAfterDiscountItem
            : 0;

          const discountPercentageItem = productShopItem
            ? calculateDiscountPercentage(
                productShopItem.price!,
                totalPriceAfterDiscountItem
              )
            : 0;

          return {
            ...item,
            benefitItem,
            beneficeAfterDiscountItem,
            totalPriceAfterDiscountItem,
            discountPercentageItem,
            productShopPrice: productShopItem?.price ?? 0,
          };
        })
        .slice(0, 4),
    [filteredProducts, productsShop]
  );

  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preferences.background),
    [preferences.background]
  );

  if (
    !isClient ||
    itemsSlides.length < 2 ||
    products.length < 3 ||
    productsShop.length < 3
  )
    return null;

  const shopUrl = `/${shop.slug}`;

  // Glass styles
  const glassCard = `backdrop-blur-xl ${
    bgIsLightOrDark === "light" ? "bg-white/10" : "bg-black/20"
  } border border-white/30 dark:border-black/30 shadow-lg`;

  // const textColor =
  //   bgIsLightOrDark !== "light" ? "text-neutral-900" : "text-neutral-100";

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 w-full 
    lg:h-[80vh] flex items-center justify-center"
      style={{
        paddingTop: Number(preferences.Header) === 3 ? 50 : 0,
      }}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 
      lg:grid-cols-4 gap-6 w-full py-16 lg:py-24"
      >
        {/* Text block */}
        <div
          className={`${glassCard} col-span-1 sm:col-span-2 shadow
          flex flex-col justify-center p-8 rounded-3xl transition`}
          style={{
            borderRadius: preferences.buttonRadius,
            color: preferences.textColor,
          }}
        >
          <h3
            className="text-4xl md:text-5xl font-bold tracking-tight 
          mb-4 leading-tight"
          >
            {preferences.title}
          </h3>
          <p className="text-base md:text-lg opacity-80 line-clamp-4">
            {preferences.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Link
              href={`${shopUrl}/catalogues`}
              className="px-5 py-2.5 flex items-center justify-center gap-2 font-medium transition-all border group"
              style={{
                borderColor: preferences.buttonColor,
                borderRadius: preferences.buttonRadius,
                backgroundColor: preferences.buttonColor,
                color: preferences.buttonTextColor,
              }}
            >
              <span>Découvrir les produits</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500 ease-in-out" />
            </Link>
            <p className="text-sm opacity-70 max-w-xs">
              Plus de {filteredProducts.length} articles disponibles dans notre
              catalogue.
            </p>
          </div>
        </div>

        {/* Product cards */}
        {itemsSlides.slice(0, 2).map((product) => (
          <div
            key={product.id}
            className="relative w-full h-96 lg:h-full rounded-3xl 
            overflow-hidden shadow 
            group"
            style={{
              borderRadius: preferences.buttonRadius,
            }}
          >
            {/* Product image */}
            {product.image && (
              <Image
                src={product.image}
                alt={product.name + " image"}
                priority
                width={400}
                height={600}
                className="w-full h-full object-cover group-hover:scale-105 
                transition-transform duration-700 ease-in-out brightness-90"
                style={{
                  borderRadius: preferences.buttonRadius,
                }}
                unoptimized
              />
            )}

            {/* Glass info overlay */}
            <div
              className={`${glassCard} absolute bottom-4 left-4 right-4 p-4 
              rounded-2xl
              
              `}
              style={{
                borderRadius: preferences.buttonRadius,
                color: preferences.buttonTextColor,
              }}
            >
              <h3 className="text-lg font-semibold line-clamp-1">
                {capitalizeText(product.name)}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-bold">
                  {returnFormatedMoney(
                    product.totalPriceAfterDiscountItem * exchange
                  )}
                  <span className="ml-1 text-xs">{currency}</span>
                  {product.discountPercentageItem > 0 && (
                    <span className="ml-2 text-[10px] md:text-sm text-red-500">
                      -{product.discountPercentageItem}%
                    </span>
                  )}
                </span>
                <Link
                  href={`${shopUrl}/catalogues/${product.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 
                  text-sm font-medium transition-all shadow"
                  style={{
                    borderRadius: preferences.buttonRadius,
                    backgroundColor: preferences.buttonColor,
                    color: preferences.buttonTextColor,
                  }}
                >
                  <span>Acheter</span>
                  <ShoppingCart className="size-4 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopHero;
