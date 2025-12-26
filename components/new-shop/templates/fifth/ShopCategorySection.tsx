"use client";

import React, { useMemo } from "react";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import Image from "next/image";
import Link from "next/link";
import { MoveRight, Sparkles } from "lucide-react";
import { catShopType, returnDataByCatShop } from "@/utils/preferences";
import { luminanceColor } from "@/utils/shopFunctions";
import { cn } from "@/lib/utils";

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

  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preferences.background),
    [preferences.background]
  );

  const isDark = bgIsLightOrDark !== "light";

  return (
    <section
      className={cn(
        "py-20 my-10 lg:pb-0 w-full max-w-7xl mx-auto px-6 lg:px-0 shadow-2xl transition-all duration-500 border",
        getMyFont.className,
        "lg:shadow-none lg:border-0"
      )}
      style={{
        borderRadius: preferences.buttonRadius,
        backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
      }}
    >
      {/* En-tête de section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-50">
            <Sparkles size={16} style={{ color: preferences.buttonColor }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-current">
              Collections
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-current">
            Les catégories
          </h2>
        </div>
        <p className="text-sm opacity-50 max-w-xs font-medium">
          Explorez nos sélections exclusives conçues pour votre style de vie.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 mt-6 md:mt-0 lg:grid-cols-4 gap-6 md:gap-8">
        {DataCat.map((item) => (
          <Link
            key={item.title}
            href={`/${shop.slug}${item.link}`}
            className="group relative flex flex-col shadow-xl transition-all duration-500 hover:-translate-y-2"
            style={{ borderRadius: preferences.buttonRadius }}
          >
            {/* Conteneur Image avec hauteur fixe pour iPhone */}
            <div
              className="relative w-full h-[350px] md:h-[400px] overflow-hidden"
              style={{ borderRadius: preferences.buttonRadius, height: 350 }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-90 group-hover:brightness-75"
                priority
              />

              {/* Overlay Gradient permanent pour la lisibilité du titre en bas */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Contenu textuel flottant */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end items-start">
                <div className="overflow-hidden">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter translate-y-0 transition-transform duration-500 group-hover:-translate-y-1">
                    {item.title}
                  </h3>
                </div>

                <div
                  className="mt-4 flex items-center gap-2 px-4 py-2 backdrop-blur-md border border-white/20 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500"
                  style={{
                    borderRadius: `calc(${preferences.buttonRadius} / 2)`,
                  }}
                >
                  <span>Découvrir</span>
                  <MoveRight
                    size={14}
                    className="-rotate-45 group-hover:rotate-0 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Carte "Tout voir" stylisée comme une carte d'action */}
        <Link
          href={`/${shop.slug}/catalogues`}
          className="relative h-[350px] md:h-[400px] flex flex-col items-center justify-center p-8 text-center transition-all duration-500 group"
          style={{
            borderRadius: preferences.buttonRadius,
            backgroundColor: preferences.buttonColor,
            color: preferences.buttonTextColor,
            height: 350,
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-white" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-white/10 mb-2 group-hover:scale-110 transition-transform duration-500">
              <MoveRight
                size={32}
                className="-rotate-45 group-hover:rotate-0 transition-transform duration-500"
              />
            </div>
            <span className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              Tout
              <br />
              voir
            </span>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold mt-2">
              Catalogue Complet
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default ShopCategorySection;
