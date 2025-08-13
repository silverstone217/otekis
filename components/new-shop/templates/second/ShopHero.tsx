"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Preferences, Product, ProductShop, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { capitalizeText } from "@/utils/shopFunctions";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
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
  const [index, setIndex] = useState(0);
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

  // Prendre les 4 premiers produits
  const itemsSlides = useMemo(
    () => filteredProducts.slice(0, 4),
    [filteredProducts]
  );

  // Sécuriser currentItem
  const currentItem = itemsSlides[index] ?? null;

  // Trouver une seule fois le produit shop associé
  const productShop = useMemo(() => {
    if (!currentItem) return null;
    return productsShop.find((pr) => pr.productId === currentItem.id) ?? null;
  }, [currentItem, productsShop]);

  // Calcul du bénéfice
  const benefit = useMemo(() => {
    if (!productShop?.percentage || !currentItem) return 0;
    return Math.round((productShop.percentage * currentItem.price) / 100);
  }, [productShop?.percentage, currentItem]);

  // Prix total sans reduction
  const totalPrice = useMemo(() => {
    if (!productShop || productShop.price === null || !currentItem || !benefit)
      return 0;
    return benefit + productShop.price;
  }, [productShop, currentItem, benefit]);

  // Bénéfice après promotion
  const beneficeAfterDiscount = useMemo(() => {
    if (!productShop?.promotion) return benefit;
    return applyPromotionOnProfit(benefit, productShop.promotion);
  }, [benefit, productShop?.promotion]);

  // Prix total après réduction
  const totalPriceAfterDiscount = useMemo(() => {
    if (!currentItem) return 0;
    return currentItem.price + beneficeAfterDiscount;
  }, [currentItem, beneficeAfterDiscount]);

  // Calcul du pourcentage de réduction
  const _discountPercentage = useMemo(() => {
    if (!productShop?.price) return 0;
    return calculateDiscountPercentage(
      productShop.price,
      totalPriceAfterDiscount
    );
  }, [productShop?.price, totalPriceAfterDiscount]);

  // HEADER NUM POSITION
  const Header = preference.Header;

  if (!isClient) return null;

  if (itemsSlides.length < 3) return null;

  return (
    <div
      className={`relative w-full min-h-[70svh]
    overflow-hidden transition-all duration-500 ease-in-out px-4 pb-4
     ${Number(Header) === 3 ? "pt-20" : "pt0"}
    `}
    >
      {/* grid */}
      {itemsSlides.length >= 3 && (
        <div
          className="grid lg:grid-cols-6 grid-cols-1 gap-3 lg:h-[65svh] w-full 
        transition-all duration-500 ease-in-out text-white"
        >
          {/* big grid cols-4 on lg */}
          <div className="lg:col-span-4 w-full h-[55svh] lg:h-[65svh] rounded-lg relative">
            {/* image */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={itemsSlides[0].image}
                alt={itemsSlides[0].name}
                width={1200}
                height={800}
                className="object-cover w-full h-full "
                priority
                style={{
                  borderRadius: preference.buttonRadius,
                }}
              />
            </div>
            {/* info */}
            <div
              className="absolute w-full h-full z-10 top-0 left-0 right-0 bottom-0
            bg-gradient-to-t from-black/40 to-transparent
            "
              style={{
                borderRadius: preference.buttonRadius,
              }}
            >
              <div
                className="flex w-full lg:w-[350px] h-full flex-col p-10 gap-8
              justify-end
              "
              >
                {/* name */}
                <h2
                  className="text-pretty text-3xl lg:text-5xl font-bold line-clamp-3 
                tracking-wide w-full"
                >
                  {itemsSlides[0].name && capitalizeText(itemsSlides[0].name)}
                </h2>

                {/* desc */}
                <p className="text-sm opacity-80 line-clamp-3">
                  {itemsSlides[0].description &&
                    capitalizeText(itemsSlides[0].description)}
                </p>

                {/* link btn */}
                <Link
                  style={{
                    textDecoration: "none",
                    backgroundColor: preference.buttonColor,
                    color: preference.buttonTextColor,
                    borderRadius: preference.buttonRadius,
                  }}
                  href={`/${shop.slug}/catalogues/${itemsSlides[0].id}`}
                  className="font-medium px-10 py-2 hover:opacity-70
              transition-all duration-500 ease-in-out shadow-md
              flex items-center justify-center
              "
                >
                  Acheter
                </Link>
              </div>
            </div>
          </div>

          {/* small grid cols-2 on sm */}
          <div
            className="col-span-1 lg:col-span-2 grid lg:grid-cols-1 grid-cols-2 gap-3 lg:full items-center 
          justify-center lg:h-[65svh] lg:flex flex-col
          "
          >
            {/* sub grid 1 */}
            <div className="w-full h-[25svh] lg:flex-1 relative transition-all duration-500 ease-in-out">
              {/* image */}
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={itemsSlides[1].image}
                  alt={itemsSlides[1].name}
                  width={1200}
                  height={800}
                  className="object-cover w-full h-full "
                  priority
                  style={{
                    borderRadius: preference.buttonRadius,
                  }}
                />
              </div>

              {/* info */}
              <div
                className="absolute w-full h-full z-10 top-0 left-0 right-0 bottom-0
            bg-gradient-to-t from-black/40 to-transparent"
                style={{
                  borderRadius: preference.buttonRadius,
                }}
              >
                <div
                  className="flex w-full h-full flex-col p-4 gap-4 lg:p-10 lg:gap-8
              justify-end
              "
                >
                  {/* name */}
                  <h2
                    className="text-pretty text-md md:text-xl lg:text-2xl font-bold line-clamp-2 
                tracking-wide w-full"
                  >
                    {itemsSlides[1].name && capitalizeText(itemsSlides[1].name)}
                  </h2>

                  {/* link btn */}
                  <Link
                    style={{
                      textDecoration: "none",
                      borderColor: preference.buttonColor,
                      color: "white",
                      borderRadius: preference.buttonRadius,
                      backgroundColor: "transparent",
                      borderWidth: 2,
                    }}
                    href={`/${shop.slug}/catalogues/${itemsSlides[1].id}`}
                    className="font-medium px-6 lg:px-10 py-1 hover:scale-105
                    transition-all duration-500 ease-in-out shadow-md
                    flex items-center justify-center lg:w-[60%]
              "
                  >
                    Acheter
                  </Link>
                </div>
              </div>
            </div>

            {/* sub grid 2 */}
            <div className="w-full h-[25svh] lg:flex-1 relative transition-all duration-500 ease-in-out">
              {/* image */}
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={itemsSlides[2].image}
                  alt={itemsSlides[2].name}
                  width={1200}
                  height={800}
                  className="object-cover w-full h-full "
                  priority
                  style={{
                    borderRadius: preference.buttonRadius,
                  }}
                />
              </div>

              {/* info */}
              <div
                className="absolute w-full h-full z-10 top-0 left-0 right-0 bottom-0
            bg-gradient-to-t from-black/40 to-transparent"
                style={{
                  borderRadius: preference.buttonRadius,
                }}
              >
                <div
                  className="flex w-full h-full flex-col p-4 gap-4 lg:p-10 lg:gap-8
              justify-end
              "
                >
                  {/* name */}
                  <h2
                    className="text-pretty text-md md:text-xl lg:text-2xl font-bold line-clamp-2 
                tracking-wide w-full"
                  >
                    {itemsSlides[2].name && capitalizeText(itemsSlides[2].name)}
                  </h2>

                  {/* link btn */}
                  <Link
                    style={{
                      textDecoration: "none",
                      borderColor: preference.buttonColor,
                      color: "white",
                      borderRadius: preference.buttonRadius,
                      backgroundColor: "transparent",
                      borderWidth: 2,
                    }}
                    href={`/${shop.slug}/catalogues/${itemsSlides[2].id}`}
                    className="font-medium px-6 lg:px-10 py-1 hover:scale-105
                    transition-all duration-500 ease-in-out shadow-md
                    flex items-center justify-center lg:w-[60%]
              "
                  >
                    Acheter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopHero;
