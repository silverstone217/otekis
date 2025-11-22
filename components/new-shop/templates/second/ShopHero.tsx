"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Preferences, Product, ProductShop, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnFormatedMoney,
} from "@/utils/functions";

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
  // const [index] = useState(0);
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

  // Prendre les 4 premiers produits avec leurs infos prix, promos, etc
  const itemsSlides = useMemo(
    () =>
      filteredProducts
        .map((item) => {
          const productShopItem =
            productsShop.find((pr) => pr.productId === item.id) ?? null;
          const benefitItem = productShopItem
            ? Math.round((productShopItem.percentage * item.price) / 100)
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
    itemsSlides.length < 2 ||
    products.length < 3 ||
    productsShop.length < 3
  )
    return null;

  return (
    <div
      className={`relative w-full min-h-[70svh] overflow-hidden 
        transition-all duration-500 ease-in-out px-4 pb-6 max-w-7xl mx-auto ${
          Number(preference.Header) === 3 ? "pt-20" : "pt-0"
        } ${getMyFont.variable}`}
      style={{ fontFamily: getMyFont.style.fontFamily }}
    >
      {itemsSlides.length >= 3 && (
        <div
          className="grid lg:grid-cols-6 grid-cols-1 gap-5 lg:h-[65svh] w-full text-white"
          style={{ color: "white" }}
        >
          {/* Grande image colonne gauche */}
          <div
            className="lg:col-span-4 w-full h-[55svh] lg:h-[65svh] rounded-2xl relative shadow-2xl overflow-hidden"
            style={{ borderRadius: preference.buttonRadius }}
          >
            <Image
              src={itemsSlides[0].image}
              alt={itemsSlides[0].name}
              fill
              className="object-cover transition-transform duration-700 ease-in-out hover:scale-105"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              unoptimized
            />
            {/* Overlay Dégradé */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10"
              style={{ borderRadius: preference.buttonRadius }}
            >
              <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-wide line-clamp-3 mb-4">
                {capitalizeText(itemsSlides[0].name)}
              </h2>
              <p className="text-sm lg:text-base opacity-80 line-clamp-2 md:line-clamp-3 mb-6">
                {capitalizeText(itemsSlides[0].description)}
              </p>
              <Link
                href={`/${shop.slug}/catalogues/${itemsSlides[0].id}`}
                className="flex items-center bg-primary hover:bg-primary-dark 
                transition-colors duration-300 text-white font-semibold 
                py-3 px-12 rounded-xl shadow-lg"
                style={{
                  backgroundColor: preference.buttonColor,
                  borderRadius: preference.buttonRadius,
                  color: preference.buttonTextColor,
                }}
              >
                <span>Acheter</span>
                <span className="ml-2">
                  {returnFormatedMoney(
                    itemsSlides[0].totalPriceAfterDiscountItem * exchange
                  )}
                  <span className="ml-1 text-xs">{currency}</span>
                </span>
                {itemsSlides[0].discountPercentageItem > 0 &&
                  itemsSlides[0].price * exchange !==
                    itemsSlides[0].productShopPrice * exchange && (
                    <span
                      className={`ml-auto text-[8px] md:text-[10px] ${
                        luminance === "dark" ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      -{itemsSlides[0].discountPercentageItem} %
                    </span>
                  )}
              </Link>
            </div>
          </div>

          {/* Deux petites images colonne droite */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-5">
            {[itemsSlides[1], itemsSlides[2]].map((item) => (
              <div
                key={item.id}
                className="relative w-full h-[25svh] lg:h-[32svh] rounded-xl 
                shadow-lg overflow-hidden cursor-pointer 
                transition-transform duration-500 hover:scale-[1.03]"
                style={{
                  borderRadius: preference.buttonRadius,
                  border: `2px solid ${preference.buttonColor}`,
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 50vw, 30vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 
                  to-transparent flex flex-col justify-end p-5"
                  style={{ borderRadius: preference.buttonRadius }}
                >
                  <h3
                    className="text-lg lg:text-xl font-bold line-clamp-2 
                  tracking-wide mb-2 text-white"
                  >
                    {capitalizeText(item.name)}
                  </h3>
                  <Link
                    href={`/${shop.slug}/catalogues/${item.id}`}
                    className="flex items-center justify-center font-medium text-white border-2 
                    border-white py-1 px-6 rounded-lg hover:bg-white hover:text-black 
                    transition-colors duration-300  text-center w-full text-[10px] md:text-xs
                    "
                    style={{ borderRadius: preference.buttonRadius }}
                  >
                    <span>Acheter</span>
                    <span className="ml-2 text-[8px] md:text-sm">
                      {returnFormatedMoney(
                        item.totalPriceAfterDiscountItem * exchange
                      )}
                      <span className="ml-1 text-[8px] md:text-[10px]">
                        {currency}
                      </span>
                    </span>
                    {item.discountPercentageItem > 0 &&
                      item.price * exchange !==
                        item.productShopPrice * exchange && (
                        <span
                          className={`ml-auto text-[10px] hidden md:block ${
                            luminance === "dark"
                              ? "text-red-400"
                              : "text-red-600"
                          }`}
                        >
                          -{item.discountPercentageItem} %
                        </span>
                      )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopHero;
