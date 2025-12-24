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
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnFormatedMoney,
} from "@/utils/functions";
import { cn } from "@/lib/utils";
import { ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";

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
  currency,
  exchange,
}: ShopHeroType) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clone et shuffle sans muter l'original
  const shuffleArray = (array: Product[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Produits mélangés
  const filteredProducts = useMemo(() => {
    return shuffleArray(products);
  }, [products]);

  const luminance = useMemo(() => {
    return luminanceColor(preference.background);
  }, [preference.background]);

  // Logique de données (prix, réductions, etc.)
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

  if (
    !isClient ||
    itemsSlides.length < 3 ||
    products.length < 3 ||
    productsShop.length < 3
  )
    return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden transition-all duration-500 ease-in-out px-4 pb-12 max-w-7xl mx-auto",
        Number(preference.Header) === 3 ? "pt-24" : "pt-6",
        getMyFont.className
      )}
    >
      <div className="grid lg:grid-cols-6 grid-cols-1 gap-6 lg:h-[70svh] w-full">
        {/* --- PRODUIT PRINCIPAL (GAUCHE) --- */}
        <div
          className="lg:col-span-4 w-full h-[55svh] lg:h-full relative shadow-2xl overflow-hidden group"
          style={{ borderRadius: preference.buttonRadius }}
        >
          <Image
            src={itemsSlides[0].image}
            alt={itemsSlides[0].name}
            fill
            className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            unoptimized
          />

          {/* Overlay avec dégradé riche */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
            {itemsSlides[0].discountPercentageItem > 0 && (
              <div className="mb-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit animate-pulse tracking-widest uppercase">
                Offre Limitée -{itemsSlides[0].discountPercentageItem}%
              </div>
            )}

            <h2 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter text-white uppercase italic mb-4 max-w-2xl">
              {capitalizeText(itemsSlides[0].name)}
            </h2>

            <p className="text-white/70 text-sm md:text-base max-w-lg line-clamp-2 mb-8 font-light">
              {capitalizeText(itemsSlides[0].description)}
            </p>

            <Link
              href={`/${shop.slug}/catalogues/${itemsSlides[0].id}`}
              className="flex items-center gap-4 w-fit transition-all duration-300 active:scale-95 group/btn"
              style={{
                backgroundColor: preference.buttonColor,
                borderRadius: preference.buttonRadius,
                color: preference.buttonTextColor,
                padding: "1rem 2rem",
              }}
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold opacity-70 mb-1">
                  Acheter
                </span>
                <span className="text-xl font-black tracking-tight">
                  {returnFormatedMoney(
                    itemsSlides[0].totalPriceAfterDiscountItem * exchange
                  )}
                  <small className="ml-1 text-sm uppercase">{currency}</small>
                </span>
              </div>
              <div className="h-8 w-px bg-white/20 mx-2" />
              <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* --- PRODUITS SECONDAIRES (DROITE) --- */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {[itemsSlides[1], itemsSlides[2]].map((item) => (
            <div
              key={item.id}
              className="relative w-full h-[30svh] lg:h-full group overflow-hidden shadow-lg border border-black/5"
              style={{ borderRadius: preference.buttonRadius }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 1024px) 50vw, 30vw"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-1 tracking-tight uppercase italic">
                  {capitalizeText(item.name)}
                </h3>

                <Link
                  href={`/${shop.slug}/catalogues/${item.id}`}
                  className="group/small flex items-center justify-between bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 px-4 py-2.5 transition-all duration-500"
                  style={{ borderRadius: preference.buttonRadius }}
                >
                  <span className="text-white group-hover/small:text-black font-bold text-sm tracking-tighter">
                    {returnFormatedMoney(
                      item.totalPriceAfterDiscountItem * exchange
                    )}{" "}
                    {currency}
                  </span>
                  <div className="p-1.5 bg-white rounded-full text-black">
                    <ShoppingCart size={14} />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopHero;
