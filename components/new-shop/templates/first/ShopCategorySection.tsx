"use client";
import { Preferences, Product, ProductShop, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { catShopType, returnDataByCatShop } from "@/utils/preferences";

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
    <div className="w-full grid grid-cols-1 md:grid-cols-3 transition-all duration-500 ease-in-out">
      {DataCat.map((item, idx) => (
        <div
          className="w-full h-[55dvh] xl:h-[70dvh]  group relative
        transition-all duration-500 ease-in-out group "
          key={idx}
        >
          <Image
            src={item.image}
            alt={item.title}
            width={1200}
            height={1000}
            priority
            className="object-cover transition-all duration-500 ease-in-out absolute inset-0
          h-full w-full group-hover:opacity-0"
          />
          <Image
            src={item.image2}
            alt={item.title}
            width={1400}
            height={1800}
            priority
            className="object-cover opacity-0 group-hover:opacity-100 absolute inset-0
          transition-all duration-500 ease-in-out h-full w-full group-hover:scale-105
          group-hover:z-20 group-hover:shadow-2xl group-hover:border
          "
          />
          {/* link */}
          <Link
            style={{
              textDecoration: "none",
              backgroundColor: preferences.buttonColor,
              color: preferences.buttonTextColor,
              borderRadius: preferences.buttonRadius,
            }}
            href={`/${shop.slug}${item.link}`}
            className="font-medium px-10 py-2 hover:opacity-70 hover:shadow-2xl
            transition-all duration-500 ease-in-out shadow-md absolute z-30
            top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:px-14
            hover:font-bold
            "
          >
            {item.title}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ShopCategorySection;
