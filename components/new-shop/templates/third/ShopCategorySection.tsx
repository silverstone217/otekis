"use client";
import {
  Preferences,
  Product,
  ProductShop,
  Shop,
} from "@/lib/generated/prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { catShopType, returnDataByCatShop } from "@/utils/preferences";
import { MoveRight, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShopCategorySectionType = {
  shop: Shop;
  preferences: Preferences;
  getMyFont: NextFontWithVariable;
  products: Product[];
  productsShop: ProductShop[];
};

const ShopCategorySection = ({
  shop,
  getMyFont,
  preferences,
}: ShopCategorySectionType) => {
  const DataCat = returnDataByCatShop(shop.category as catShopType);

  return (
    <div className={cn("w-full py-16 px-4", getMyFont?.className)}>
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header avec ligne de design */}
        <div className="flex items-end justify-between border-b-2 border-current/10 pb-6">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
            Les catégories
          </h2>
          <LayoutGrid className="size-8 opacity-20 mb-2 hidden sm:block" />
        </div>

        {/* Grille Bento */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
          border-2 shadow-2xl overflow-hidden w-full"
          style={{
            borderColor: `${preferences.buttonColor}20`,
            borderRadius: preferences.buttonRadius,
          }}
        >
          {DataCat.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="group relative w-full h-[300px] lg:h-[450px] 
              overflow-hidden border-current/5 border-b sm:border-b-0 sm:border-r"
              style={{
                position: "relative",
                height: 300,
              }}
            >
              {/* Image avec zoom au hover */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 brightness-[0.85] group-hover:brightness-[0.7]"
                priority
                unoptimized
              />

              {/* Contenu Absolute */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                <Link
                  href={`/${shop.slug}${item.link}`}
                  className="px-6 py-3 flex items-center justify-center gap-3 group/link backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    borderRadius: preferences.buttonRadius,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    color: "white",
                  }}
                >
                  <span className="font-bold uppercase tracking-widest text-xs md:text-sm">
                    {item.title}
                  </span>
                  <div className="bg-white/10 p-1 rounded-full">
                    <MoveRight className="group-hover/link:rotate-0 -rotate-45 transition-transform duration-500 ease-in-out size-4" />
                  </div>
                </Link>
              </div>
            </div>
          ))}

          {/* CASE "TOUT VOIR" - Stylisée différemment */}
          <div
            className="relative w-full h-[300px] lg:h-[450px] flex items-center justify-center overflow-hidden p-8 text-center transition-colors duration-500"
            style={{
              backgroundColor: preferences.buttonColor,
              height: 300,
            }}
          >
            {/* Pattern de fond discret */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-wrap gap-4 p-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <LayoutGrid key={i} className="size-12 rotate-12" />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="space-y-1">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60"
                  style={{ color: preferences.buttonTextColor }}
                >
                  Full Catalogue
                </p>
                <h3
                  className="text-2xl font-black uppercase italic leading-none"
                  style={{ color: preferences.buttonTextColor }}
                >
                  Toute la boutique
                </h3>
              </div>

              <Link
                href={`/${shop.slug}/catalogues`}
                className="flex items-center justify-center gap-3 px-8 py-4 shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group/all"
                style={{
                  borderRadius: preferences.buttonRadius,
                  backgroundColor: preferences.background,
                  color: preferences.textColor,
                }}
              >
                <span className="font-bold uppercase tracking-widest text-xs">
                  Découvrir
                </span>
                <MoveRight className="group-hover/all:translate-x-2 transition-transform duration-500 size-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCategorySection;
