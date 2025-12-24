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
import { ArrowRight, ShoppingCart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  getMyFont,
  products,
  productsShop,
  exchange,
  currency,
}: ShopHeroType) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

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
    () =>
      filteredProducts
        .map((item) => {
          const productShopItem =
            productsShop.find((pr) => pr.productId === item.id) ?? null;
          const benefitItem = productShopItem
            ? productShopItem.price! - (item.price ?? 0)
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
            totalPriceAfterDiscountItem,
            discountPercentageItem,
          };
        })
        .slice(0, 2),
    [filteredProducts, productsShop]
  );

  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preferences.background),
    [preferences.background]
  );

  if (!isClient || itemsSlides.length < 2) return null;

  const isDark = bgIsLightOrDark !== "light";

  return (
    <section
      className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 w-full lg:min-h-[75vh] flex items-center justify-center py-12",
        getMyFont?.className
      )}
      style={{ paddingTop: Number(preferences.Header) === 3 ? 100 : 40 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {/* --- CARTE TEXTE PRINCIPALE --- */}
        <div
          className="col-span-1 sm:col-span-2 flex flex-col justify-center p-10 relative overflow-hidden group shadow-2xl transition-all duration-500 border"
          style={{
            borderRadius: preferences.buttonRadius,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            color: preferences.textColor,
          }}
        >
          {/* Décoration de fond subtile */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20"
            style={{ backgroundColor: preferences.buttonColor }}
          />

          <div className="relative z-10">
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-[0.9] uppercase italic">
              {preferences.title}
            </h3>
            <p className="text-base md:text-lg opacity-70 leading-relaxed max-w-md font-light">
              {preferences.description}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Link
                href={`/${shop.slug}/catalogues`}
                className="group flex items-center gap-4 px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl"
                style={{
                  backgroundColor: preferences.buttonColor,
                  borderRadius: preferences.buttonRadius,
                  color: preferences.buttonTextColor,
                }}
              >
                <span>Explorer le shop</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </Link>

              <div className="flex flex-col">
                <span className="text-xl font-black">
                  {filteredProducts.length}+
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-50">
                  Articles disponibles
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CARTES PRODUITS --- */}
        {itemsSlides.map((product, idx) => (
          <div
            key={product.id}
            className={cn(
              "relative w-full h-[50vh] lg:h-full overflow-hidden shadow-2xl group transition-all duration-700 hover:-translate-y-2",
              idx === 1 ? "lg:mt-12" : "lg:-mt-12" // Effet décalé (Staggered grid)
            )}
            style={{ borderRadius: preferences.buttonRadius }}
          >
            {/* Image avec Overlay sombre */}
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.85]"
              unoptimized
            />

            {/* Promo Badge */}
            {product.discountPercentageItem > 0 && (
              <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-sm flex items-center gap-1 shadow-lg">
                <Sparkles size={10} />-{product.discountPercentageItem}%
              </div>
            )}

            {/* Info Glass Card */}
            <div
              className="absolute bottom-4 left-4 right-4 p-5 backdrop-blur-2xl border border-white/20 flex flex-col gap-3 transition-all duration-500 group-hover:bottom-6"
              style={{
                borderRadius: `calc(${preferences.buttonRadius} / 1.5)`,
                backgroundColor: "rgba(0,0,0,0.4)",
                color: "#ffffff", // Forcé en blanc pour la lisibilité sur image
              }}
            >
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight line-clamp-1 opacity-80">
                  {capitalizeText(product.name)}
                </h4>
                <p className="text-lg font-black tracking-tighter">
                  {returnFormatedMoney(
                    product.totalPriceAfterDiscountItem * exchange
                  )}
                  <small className="ml-1 text-[10px] uppercase font-bold">
                    {currency}
                  </small>
                </p>
              </div>

              <Link
                href={`/${shop.slug}/catalogues/${product.id}`}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 shadow-lg"
                style={{
                  borderRadius: `calc(${preferences.buttonRadius} / 2)`,
                  backgroundColor: preferences.buttonColor,
                  color: preferences.buttonTextColor,
                }}
              >
                <span>Acheter</span>
                <ShoppingCart size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopHero;
