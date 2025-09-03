"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Product, ProductShop, Shop, Preferences } from "@prisma/client";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnFormatedMoney,
} from "@/utils/functions";
import { ArrowRight } from "lucide-react";

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
  const [index, setIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  const itemsSlides = useMemo(
    () => filteredProducts.slice(0, 4),
    [filteredProducts]
  );

  // Auto slide
  useEffect(() => {
    if (itemsSlides.length === 0) return;
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % itemsSlides.length),
      8000
    );
    return () => clearInterval(interval);
  }, [itemsSlides.length]);

  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preferences.background),
    [preferences.background]
  );

  const backdropStyles = {
    backgroundColor:
      bgIsLightOrDark === "light"
        ? "rgba(255,255,255,0.2)"
        : "rgba(0,0,0,0.35)",
    borderColor:
      bgIsLightOrDark === "light" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
    textColor:
      bgIsLightOrDark === "light" ? "text-neutral-900" : "text-neutral-100",
  };

  if (!isClient || itemsSlides.length < 2) return null;

  const shopUrl = `/${shop.slug}`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-4">
      <div
        className="relative w-full h-[70svh] sm:h-[60svh] 
        lg:h-[50svh] overflow-hidden rounded-2xl shadow-xl"
        style={{
          borderRadius: preferences.buttonRadius,
          border: `1px solid ${backdropStyles.borderColor}`,
          background: backdropStyles.backgroundColor,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Slides */}
        {itemsSlides.map((item, idx) => {
          const isActive = idx === index;
          const productShop = productsShop.find((p) => p.productId === item.id);

          // benefit
          const benefit = productShop
            ? Math.round((productShop.percentage! * item.price) / 100)
            : 0;

          const beneficeAfterDiscount = productShop
            ? applyPromotionOnProfit(benefit!, productShop.promotion!)
            : 0;

          const totalPriceAfterDiscount = item.price + beneficeAfterDiscount;

          const discountPercentage = productShop
            ? calculateDiscountPercentage(
                productShop.price!,
                totalPriceAfterDiscount
              )
            : 0;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 flex flex-col 
              sm:grid sm:grid-cols-2 lg:grid-cols-3 w-full 
              h-full transition-all duration-700 ease-in-out
              ${
                isActive
                  ? "opacity-100 translate-x-0 scale-100 z-10"
                  : "opacity-0 translate-x-10 scale-95 z-0"
              }
              `}
            >
              {/* Image */}
              <div className="relative col-span-1 h-64 sm:h-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className={`object-cover sm:rounded-l-2xl 
                  sm:rounded-tr-none transition-all duration-700
                   `}
                  priority={isActive}
                  // style={{
                  //   borderTopLeftRadius: preferences.buttonRadius,
                  //   borderTopRightRadius: preferences.buttonRadius,
                  // }}
                />
              </div>

              {/* Content */}
              <div
                className="flex flex-col justify-center p-6 lg:col-span-2 
              space-y-4 relative"
              >
                <h3
                  className={`text-3xl md:text-4xl font-bold line-clamp-2 
                  ${backdropStyles.textColor}`}
                >
                  {capitalizeText(item.name)}
                </h3>
                <p
                  className={`text-sm opacity-80 line-clamp-3 
                  ${backdropStyles.textColor}`}
                >
                  {capitalizeText(item.description)}
                </p>

                {/* Price */}
                <div
                  className="mt-4 flex items-center gap-4 w-full justify-between 
                flex-wrap"
                >
                  <span
                    className={`text-xl font-semibold ${backdropStyles.textColor}`}
                  >
                    {returnFormatedMoney(totalPriceAfterDiscount * exchange)}
                    <span className="ml-1 text-sm">{currency}</span>
                  </span>

                  {/* Promotion */}
                  {discountPercentage > 0 && (
                    <span className={`text-sm font-semibold text-red-400`}>
                      -{discountPercentage}% offre spéciale
                    </span>
                  )}
                </div>

                {/* Button */}
                <Link
                  href={`${shopUrl}/catalogues/${item.id}`}
                  className="px-6 py-2 text-sm font-medium shadow-md 
                  transition-all hover:scale-105 hover:shadow-lg
                  flex items-center justify-between
                  "
                  style={{
                    color: preferences.buttonTextColor,
                    backgroundColor: preferences.buttonColor,
                    borderRadius: preferences.buttonRadius,
                  }}
                >
                  <span>Voir le produit</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                {/* Dots Navigation placés dans le contenu */}
                <div className="mt-6 flex justify-center gap-3">
                  {itemsSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setIndex(dotIdx)}
                      className={`w-3 h-3 rounded-full transition-all 
                        duration-500 hover:scale-125
                      ${dotIdx === index ? "w-6 bg-white/80" : "bg-white/40"}
                      `}
                      style={{
                        backdropFilter: "blur(6px)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ShopHero;
