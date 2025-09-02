"use client";

import React from "react";
import { Preferences, Product, ProductShop, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { catShopType, returnDataByCatShop } from "@/utils/preferences";

export type ShopCategorySectionType = {
  shop: Shop;
  preferences: Preferences;
  getMyFont: NextFontWithVariable;
};

const ShopCategorySection = ({
  shop,
  getMyFont,
  preferences,
}: ShopCategorySectionType) => {
  const DataCat = returnDataByCatShop(shop.category as catShopType);

  return (
    <section
      className={`pt-16 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 
        shadow-xl ${getMyFont.className}`}
    >
      <h2 className="text-5xl font-extrabold mb-8">Les catégories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {DataCat.map((item) => (
          <Link
            key={item.title}
            href={`/${shop.slug}${item.link}`}
            className="relative group rounded-2xl overflow-hidden shadow-2xl cursor-pointer
          bg-white/10 backdrop-blur-lg border border-white/20 transition-transform duration-300
          hover:scale-105 hover:shadow-3xl"
            style={{
              borderRadius: preferences.buttonRadius,
              color: preferences.textColor,
            }}
            aria-label={`Accéder à la catégorie ${item.title}`}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={600}
              height={600}
              className={`w-full h-64 sm:h-80 md:h-96 object-cover brightness-90
               
                `}
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4 px-8 py-4 bg-white/25 backdrop-blur-md rounded-lg">
                <span className="text-2xl font-semibold text-white">
                  {item.title}
                </span>
                <MoveRight className="text-white w-6 h-6 transition-transform -rotate-45 group-hover:rotate-0" />
              </div>
            </div>
          </Link>
        ))}

        {/* Carte "Tout voir" */}
        <Link
          href={`/${shop.slug}/catalogues`}
          className="relative group rounded-2xl overflow-hidden shadow-2xl cursor-pointer
          flex items-center justify-center bg-primary/60 backdrop-blur-md border border-primary text-white font-semibold text-2xl
          transition-transform duration-300 hover:bg-primary hover:shadow-3xl"
          style={{
            borderRadius: preferences.buttonRadius,
          }}
          aria-label="Voir tous les produits"
        >
          <span>Tout voir</span>
          <MoveRight className="ml-4 w-6 h-6 transition-transform -rotate-45 group-hover:rotate-0" />
        </Link>
      </div>
    </section>
  );
};

export default ShopCategorySection;
