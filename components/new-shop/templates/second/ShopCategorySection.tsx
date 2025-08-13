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
    <div className="px-2 pt-10 w-full">
      <div className="max-w-7xl mx-auto flex flex-col border-y-2">
        <h1 className="p-4 text-3xl font-bold border-x-2 border-b-2">
          Les categories
        </h1>
        <div
          className=" lg:grid grid-cols-3  w-full
    overflow-y-hidden overflow-x-auto lg:overflow-x-hidden border-r-2
    flex items-center justify-start shadow snap-mandatory snap-x
    "
        >
          {DataCat.map((item, index) => (
            <div
              key={index}
              className="flex w-full flex-col border-l-2 group snap-center"
            >
              {/* images */}
              <div
                className="lg:w-full h-[50vh] xl:h-[45vh]  relative
        transition-all duration-500 ease-in-out group 
        w-[300px] md:w-[500px] shrink-0 
        "
                key={index}
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
                        transition-all duration-500 ease-in-out h-full w-full
                        group-hover:z-20 group-hover:shadow-2xl 
                        "
                />
              </div>
              {/* bottom texts */}
              <div className="flex items-center justify-between gap-2.5 w-full p-4">
                <h3>{item.title}</h3>
                <Link
                  href={`/${shop.slug}${item.link}`}
                  className="flex items-center justify-center px-2 py-1 gap-1.5 text-sm group"
                  style={{
                    textDecoration: "none",
                    backgroundColor: preferences.buttonColor,
                    color: preferences.buttonTextColor,
                    borderRadius: preferences.buttonRadius,
                  }}
                >
                  <span>Voire</span>
                  <MoveRight className="group-hover:-rotate-90 transition-transform duration-500 ease-in-out size-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopCategorySection;
