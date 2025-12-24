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
import { ArrowRight, Sparkles } from "lucide-react";
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

  // Déterminer si le fond est clair ou sombre pour adapter la couleur du texte
  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preferences.background),
    [preferences.background]
  );

  // Couleurs de texte adaptatives si vous n'avez pas de variable textColor globale
  const adaptiveTextColor = bgIsLightOrDark !== "light" ? "#171717" : "#ffffff";
  const adaptiveMutedColor =
    bgIsLightOrDark !== "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";

  if (
    !isClient ||
    itemsSlides.length < 2 ||
    products.length < 3 ||
    productsShop.length < 3
  )
    return null;

  return (
    <section
      className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 w-full py-8",
        getMyFont?.className
      )}
    >
      <div
        className="relative w-full h-[80svh] sm:h-[65svh] lg:h-[55svh] overflow-hidden shadow-2xl transition-all duration-500"
        style={{
          borderRadius: preferences.buttonRadius,
          backgroundColor: preferences.background, // Utilise votre variable background
          marginTop: Number(preferences.Header) === 3 ? 80 : 0,
          border: `1px solid ${bgIsLightOrDark === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
        }}
      >
        {itemsSlides.map((item, idx) => {
          const isActive = idx === index;
          const productShop = productsShop.find((p) => p.productId === item.id);

          // Logique de calcul identique à l'original
          const benefit = productShop
            ? productShop.price! - (item.price ?? 0)
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
              className={cn(
                "absolute inset-0 flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-5 w-full h-full transition-all duration-1000 ease-in-out",
                isActive
                  ? "opacity-100 translate-x-0 z-10"
                  : "opacity-0 translate-x-full z-0"
              )}
            >
              {/* SECTION IMAGE */}
              <div className="relative col-span-1 lg:col-span-2 h-[40%] sm:h-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-[6000ms] ease-out",
                    isActive ? "scale-110" : "scale-100"
                  )}
                  priority={isActive}
                  unoptimized
                />
                {/* Overlay pour assurer le contraste sur l'image en mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:hidden" />
              </div>

              {/* SECTION TEXTE ET CONTENU */}
              <div className="flex flex-col justify-center p-8 md:p-12 lg:col-span-3 space-y-6 relative">
                {/* Titre et Description */}
                <div
                  className={cn(
                    "transition-all duration-700 delay-300",
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  )}
                >
                  {discountPercentage > 0 && (
                    <div className="flex items-center gap-2 mb-4 text-red-500 font-bold text-xs uppercase tracking-widest animate-pulse">
                      <Sparkles size={14} />
                      Offre Spéciale -{discountPercentage}%
                    </div>
                  )}

                  <h3
                    className="text-4xl md:text-5xl lg:text-6xl line-clamp-3
                    font-black leading-none tracking-tighter uppercase italic mb-4"
                    style={{ color: adaptiveTextColor }}
                  >
                    {item.name && capitalizeText(item.name)}
                  </h3>

                  <p
                    className="text-sm md:text-base lg:text-lg line-clamp-3 
                    font-light leading-relaxed max-w-xl"
                    style={{ color: adaptiveMutedColor }}
                  >
                    {item.description && capitalizeText(item.description)}
                  </p>
                </div>

                {/* Prix et CTA */}
                <div
                  className={cn(
                    "pt-4 space-y-8 transition-all duration-700 delay-500",
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  )}
                >
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-4xl font-black tracking-tight"
                        style={{ color: adaptiveTextColor }}
                      >
                        {returnFormatedMoney(
                          totalPriceAfterDiscount * exchange
                        )}
                        <small className="ml-1 text-sm font-bold uppercase">
                          {currency}
                        </small>
                      </span>
                      {discountPercentage > 0 && (
                        <s
                          className="opacity-30 text-sm"
                          style={{ color: adaptiveTextColor }}
                        >
                          {returnFormatedMoney(productShop!.price * exchange)}{" "}
                          {currency}
                        </s>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Link
                      href={`/${shop.slug}/catalogues/${item.id}`}
                      className="group/btn w-full sm:w-auto px-10 py-4 text-sm font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-105 flex items-center justify-between gap-8"
                      style={{
                        color: preferences.buttonTextColor,
                        backgroundColor: preferences.buttonColor,
                        borderRadius: preferences.buttonRadius,
                      }}
                    >
                      <span>Voir le produit</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-2" />
                    </Link>

                    {/* Navigation Dots */}
                    <div className="flex gap-2">
                      {itemsSlides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setIndex(dotIdx)}
                          className="h-1.5 transition-all duration-500 rounded-full"
                          style={{
                            width: dotIdx === index ? "30px" : "8px",
                            backgroundColor:
                              dotIdx === index
                                ? preferences.buttonColor
                                : adaptiveMutedColor,
                            opacity: dotIdx === index ? 1 : 0.3,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Numéro de slide en arrière-plan pour le style */}
                <span
                  className="absolute bottom-4 right-8 text-9xl font-black opacity-[0.03] select-none pointer-events-none"
                  style={{ color: adaptiveTextColor }}
                >
                  0{idx + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ShopHero;
