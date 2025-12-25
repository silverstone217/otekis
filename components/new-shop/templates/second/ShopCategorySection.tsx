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
    <section className={cn("px-4 py-16 w-full", getMyFont?.className)}>
      <div className="max-w-7xl mx-auto flex flex-col border-t-2 border-current/10">
        {/* Header de section */}
        <div className="flex items-center justify-between p-6 border-x-2 border-b-2 border-current/10">
          <div className="flex items-center gap-3">
            <LayoutGrid className="size-6 opacity-50" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">
              Les catégories
            </h2>
          </div>
          <span className="hidden md:block text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
            Explorez notre univers
          </span>
        </div>

        {/* Grille de catégories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full border-r-2 border-current/10">
          {DataCat.map((item, index) => (
            <div
              key={index}
              className="flex w-full flex-col border-l-2 border-b-2 border-current/10 group overflow-hidden"
            >
              {/* Conteneur Images */}
              <div className="relative w-full h-[45vh] md:h-[50vh] xl:h-[55vh] overflow-hidden">
                {/* Image 1 (Base) */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority
                  className="object-cover transition-all duration-700 ease-in-out absolute inset-0
                        h-full w-full group-hover:scale-110 group-hover:rotate-2 group-hover:opacity-0"
                  unoptimized
                />

                {/* Image 2 (Hover) */}
                <Image
                  src={item.image2}
                  alt={item.title}
                  fill
                  className="object-cover opacity-0 scale-125 group-hover:opacity-100 group-hover:scale-100 absolute inset-0
                        transition-all duration-700 ease-in-out h-full w-full z-10"
                  unoptimized
                />

                {/* Overlay sombre au hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
              </div>

              {/* Barre d'infos basse */}
              <div className="flex items-center justify-between gap-4 w-full p-6 bg-transparent z-30 transition-colors duration-500 group-hover:bg-current/2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">
                    Découvrir
                  </span>
                  <h3 className="text-xl font-black uppercase italic tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                    {item.title}
                  </h3>
                </div>

                <Link
                  href={`/${shop.slug}${item.link}`}
                  className="flex items-center justify-center p-4 transition-all duration-500 group/btn shadow-lg"
                  style={{
                    backgroundColor: preferences.buttonColor,
                    color: preferences.buttonTextColor,
                    borderRadius: preferences.buttonRadius,
                  }}
                >
                  <MoveRight className="group-hover:-rotate-45 transition-transform duration-500 ease-in-out size-6" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopCategorySection;
