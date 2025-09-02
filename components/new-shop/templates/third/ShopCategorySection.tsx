"use client";
import { Preferences, Product, ProductShop, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { catShopType, returnDataByCatShop } from "@/utils/preferences";
import { MoveRight } from "lucide-react";

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
  preferences: preferences,
}: ShopCategorySectionType) => {
  const DataCat = returnDataByCatShop(shop.category as catShopType);

  return (
    <div className="w-full pt-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        <h1 className="p-4 text-5xl font-bold">Les categories</h1>

        {/* tables */}
        <div className="border-2 w-full grid lg:grid-cols-4 shadow-xl ">
          {DataCat.map((item, index) => (
            <div
              key={index}
              className="w-full lg:h-[420px] h-44 md:h-48 overflow-hidden relative"
            >
              {/* image */}
              <Image
                src={item.image}
                alt={item.title}
                width={1000}
                height={1000}
                className="w-full h-full object-cover brightness-90"
                priority
              />
              {/* title  absolute*/}
              <div
                className="absolute left-0 top-0 bottom-0 right-0 flex 
              items-center justify-center"
              >
                <Link
                  href={`/${shop.slug}${item.link}`}
                  className="px-4 py-2 flex items-center justify-center 
                  gap-3 group
                  backdrop-blur-2xl
                  "
                  style={{
                    borderRadius: preferences.buttonRadius,
                    color: "white",
                  }}
                >
                  <span>{item.title}</span>
                  <MoveRight
                    className="group-hover:rotate-0  -rotate-45 transition-all 
                  duration-500 ease-in-out size-5"
                  />
                </Link>
              </div>
            </div>
          ))}

          {/* all */}
          <div className="w-full lg:h-[420px] h-44 md:h-48 overflow-hidden relative">
            {/* image */}
            <div className="w-full h-full"></div>
            {/* title  absolute*/}
            <div
              className="absolute left-0 top-0 bottom-0 right-0 flex items-center justify-center"
              style={{
                backgroundColor: preferences.buttonColor,
                color: preferences.buttonTextColor,
              }}
            >
              <Link
                href={`/${shop.slug}/catalogues`}
                className="px-4 py-2 flex items-center justify-center gap-3 group
                  backdrop-blur-xl
                  "
                style={{
                  borderRadius: preferences.buttonRadius,
                  backgroundColor: preferences.background,
                  color: preferences.textColor,
                }}
              >
                <span>Tout voire</span>
                <MoveRight
                  className="group-hover:rotate-0  -rotate-45 transition-all 
                  duration-500 ease-in-out size-5"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCategorySection;
