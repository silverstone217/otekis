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
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

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
    <section
      className={cn(
        "w-full grid grid-cols-1 md:grid-cols-3 overflow-hidden",
        getMyFont?.className
      )}
    >
      {DataCat.map((item, idx) => (
        <div
          className="group relative w-full h-[65vh] xl:h-[80vh] overflow-hidden border-r border-b border-black/5 last:border-r-0"
          key={idx}
        >
          {/* IMAGE 1 (Standard) */}
          <div
            className="absolute inset-0 z-0 transition-transform 
          duration-1000 group-hover:scale-105 "
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority
              className="object-cover transition-opacity duration-700 group-hover:opacity-0"
              unoptimized
            />
          </div>

          {/* IMAGE 2 (Hover) */}
          <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-110 group-hover:scale-100">
            <Image
              src={item.image2}
              alt={item.title}
              fill
              className="object-cover brightness-75"
              unoptimized
            />
          </div>

          {/* OVERLAY GRADIENT (Pour la lisibilité) */}
          <div className="absolute inset-0 z-20 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* CONTENU TEXTUEL & BOUTON */}
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center">
            {/* Petit texte décoratif qui apparaît au hover */}
            <span className="text-[10px] uppercase tracking-[0.4em] text-white opacity-0 -translate-y-4 group-hover:opacity-60 group-hover:translate-y-0 transition-all duration-500 mb-2">
              Collection {shop.name}
            </span>

            <Link
              href={`/${shop.slug}${item.link}`}
              className="relative flex items-center justify-center gap-3 transition-all duration-500 ease-in-out group/btn"
              style={{
                textDecoration: "none",
                backgroundColor: preferences.buttonColor,
                color: preferences.buttonTextColor,
                borderRadius: preferences.buttonRadius,
                padding: "12px 40px",
              }}
            >
              <span className="font-black uppercase tracking-widest text-xs md:text-sm">
                {item.title}
              </span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-45 group-hover/btn:scale-110" />

              {/* Effet de brillance interne au bouton (optionnel) */}
              <div className="absolute inset-0 rounded-[inherit] bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </Link>

            {/* Indication de la catégorie en bas (Style Magazine) */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">
              <div className="h-10 w-px bg-white/40 mb-4" />
              <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">
                Voir le catalogue
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ShopCategorySection;
