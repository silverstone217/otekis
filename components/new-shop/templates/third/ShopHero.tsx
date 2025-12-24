"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Preferences,
  Product,
  ProductShop,
  Shop,
} from "@/lib/generated/prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { capitalizeText } from "@/utils/shopFunctions";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnFormatedMoney,
} from "@/utils/functions";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

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
  getMyFont,
  preferences: preference,
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

  const shuffleArray = (array: Product[]) => {
    const copy = [...array];
    if (copy.length > 0) {
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
    }
    return copy ?? [];
  };

  const filteredProducts = useMemo(() => shuffleArray(products), [products]);
  const itemsSlides = useMemo(
    () => filteredProducts.slice(0, 4),
    [filteredProducts]
  );

  // Autoplay
  useEffect(() => {
    if (itemsSlides.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % itemsSlides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [itemsSlides.length]);

  if (!isClient || itemsSlides.length < 2) return null;

  return (
    <section
      className={cn(
        "relative w-full h-[85svh] lg:h-[80svh] overflow-hidden group shadow-2xl",
        getMyFont?.className
      )}
      style={{ borderRadius: preference.buttonRadius }}
    >
      {/* Slides Container */}
      <div
        className="h-full w-full flex transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {itemsSlides.map((item, idx) => {
          // Calculs spécifiques à chaque slide à l'intérieur du map
          const pShop = productsShop.find((p) => p.productId === item.id);
          const benefit = pShop ? pShop.price! - (item.price ?? 0) : 0;
          const promoBenef = pShop
            ? applyPromotionOnProfit(benefit, pShop.promotion!)
            : 0;
          const priceAfter = item.price + promoBenef;
          const hasPromo =
            pShop?.promotion &&
            pShop.promotion !== 0 &&
            pShop.price * exchange !== priceAfter * exchange;

          return (
            <div
              key={item.id}
              className="w-full shrink-0 h-full relative overflow-hidden"
            >
              {/* Image avec zoom progressif */}
              <div
                className={cn(
                  "absolute inset-0 transition-transform duration-[10s] ease-linear",
                  index === idx ? "scale-110" : "scale-100"
                )}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  unoptimized
                />
              </div>

              {/* Overlay progressif */}
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/20 to-transparent z-10" />

              {/* Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-20 max-w-4xl">
                <div
                  className={cn(
                    "transition-all duration-1000 delay-300",
                    index === idx
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  )}
                >
                  {hasPromo && (
                    <span className="inline-block px-3 py-1 mb-6 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
                      Offre Spéciale
                    </span>
                  )}

                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic mb-6">
                    {capitalizeText(item.name)}
                  </h2>

                  <p className="text-white/70 text-sm md:text-lg max-w-md mb-10 line-clamp-3 font-light leading-relaxed">
                    {capitalizeText(item.description)}
                  </p>

                  <Link
                    href={`/${shop.slug}/catalogues/${item.id}`}
                    className="flex items-center gap-6 w-fit py-4 px-8 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-black/40"
                    style={{
                      backgroundColor: preference.buttonColor,
                      color: preference.buttonTextColor,
                      borderRadius: preference.buttonRadius,
                    }}
                  >
                    <span className="uppercase font-bold tracking-widest text-xs">
                      Découvrir
                    </span>
                    <div className="h-4 w-px bg-current/20" />
                    <span className="font-black text-lg">
                      {hasPromo ? (
                        <span className="flex items-center gap-2">
                          <s className="opacity-50 text-sm font-light">
                            {returnFormatedMoney(pShop!.price * exchange)}
                          </s>
                          {returnFormatedMoney(priceAfter * exchange)}
                        </span>
                      ) : (
                        returnFormatedMoney((pShop?.price || 0) * exchange)
                      )}
                      <small className="ml-1 text-[10px]">{currency}</small>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation - Boutons stylisés qui apparaissent au hover du slider */}
      <button
        onClick={() =>
          setIndex((prev) => (prev === 0 ? itemsSlides.length - 1 : prev - 1))
        }
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={() =>
          setIndex((prev) => (prev === itemsSlides.length - 1 ? 0 : prev + 1))
        }
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black"
      >
        <ChevronRight size={24} />
      </button>

      {/* Custom Pagination Line */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {itemsSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="group relative h-1 transition-all duration-500"
            style={{ width: index === i ? "40px" : "12px" }}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                index === i ? "bg-white" : "bg-white/30"
              )}
            />
          </button>
        ))}
      </div>

      {/* Scroll Indicator (Decoration) */}
      <div className="absolute bottom-10 right-10 z-30 hidden lg:flex items-center gap-4 rotate-90 origin-right translate-y-full opacity-20">
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white">
          Slide 0{index + 1}
        </span>
        <div className="w-12 h-px bg-white" />
      </div>
    </section>
  );
};

export default ShopHero;
