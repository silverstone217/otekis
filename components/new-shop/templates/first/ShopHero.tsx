"use client";
import React from "react";
import Image from "next/image";
import { Preferences, Product, ProductShop, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import coverImg from "@/public/images/cover1.jpg";
import coverImg2 from "@/public/images/cosmetic_bg.jpg";
import { cn } from "@/lib/utils";

export type ShopHeroType = {
  shop: Shop;
  preferences: Preferences;
  getMyFont: NextFontWithVariable;
  products: Product[];
  productsShop: ProductShop[];
};

const ShopHero = ({
  shop,
  getMyFont,
  preferences: preference,
}: ShopHeroType) => {
  // text position
  const Text_position = preference.positionText as "center" | "hidden";
  const imgCoverSrc = shop.cover
    ? `url('${shop.cover}')`
    : shop.category === "cosmetiques"
    ? `url(${coverImg2.src})`
    : `url(${coverImg.src})`;

  const imgCover = shop.cover
    ? shop.cover
    : shop.category === "cosmetiques"
    ? coverImg2
    : coverImg;

  return (
    <div
      className="w-full h-[93.1svh] lg:h-[80svh] xl:h-[85svh]
     relative overflow-hidden transition-all duration-500 ease-in-out"
    >
      {/* center */}
      {Text_position === "center" && (
        <div
          className={`flex w-full h-full bg-cover bg-center bg-no-repeat
            bg-fixed transition-all duration-500 ease-in-out
        
        `}
          style={{
            backgroundImage: imgCoverSrc,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* texts */}
          <div
            style={{
              color: "#fff",
            }}
            className={cn(
              "flex w-full flex-col h-full justify-center text-balance text-center text-white",
              "bg-black/20 items-center px-4 mx-auto transition-all duration-500 ease-in-out"
            )}
          >
            <h2 className="lg:text-4xl text-3xl font-black leading max-w-lg mb-1">
              {preference.title}
            </h2>
            <p className="text-[17px] max-w-lg">{preference.description}</p>
          </div>
        </div>
      )}

      {/* Hidden */}
      {Text_position === "hidden" && (
        <div className={`flex flex-col gap-4 h-full w-full`}>
          {/* Image */}

          <Image
            src={imgCover}
            alt="Image du couverture"
            aria-hidden
            priority
            width={2000}
            height={2000}
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

export default ShopHero;
