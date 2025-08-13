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
  exchange,
  currency,
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

  // benefit
  const benefit = productShop
    ? Math.round((productShop.percentage! * currentItem.price) / 100)
    : 0;

  const beneficeAfterDiscount = productShop
    ? applyPromotionOnProfit(benefit!, productShop.promotion!)
    : 0;

  const totalPriceAfterDiscount = currentItem.price + beneficeAfterDiscount;

  const discountPercentage = productShop
    ? calculateDiscountPercentage(productShop.price!, totalPriceAfterDiscount)
    : 0;

  // // Calcul du bénéfice
  // const benefit = useMemo(() => {
  //   if (!productShop?.percentage || !currentItem) return 0;
  //   return Math.round((productShop.percentage * currentItem.price) / 100);
  // }, [productShop?.percentage, currentItem]);

  // // Prix total sans reduction
  // const totalPrice = useMemo(() => {
  //   if (!productShop || productShop.price === null || !currentItem || !benefit)
  //     return 0;
  //   return benefit + productShop.price;
  // }, [productShop, currentItem, benefit]);

  // // Bénéfice après promotion
  // const beneficeAfterDiscount = useMemo(() => {
  //   if (!productShop?.promotion) return benefit;
  //   return applyPromotionOnProfit(benefit, productShop.promotion);
  // }, [benefit, productShop?.promotion]);

  // // Prix total après réduction
  // const totalPriceAfterDiscount = useMemo(() => {
  //   if (!currentItem) return 0;
  //   return currentItem.price + beneficeAfterDiscount;
  // }, [currentItem, beneficeAfterDiscount]);

  // // Calcul du pourcentage de réduction
  // const _discountPercentage = useMemo(() => {
  //   if (!productShop?.price) return 0;
  //   return calculateDiscountPercentage(
  //     productShop.price,
  //     totalPriceAfterDiscount
  //   );
  // }, [productShop?.price, totalPriceAfterDiscount]);

  // Navigation slides
  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? itemsSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev === itemsSlides.length - 1 ? 0 : prev + 1));
  };

  // Autoplay toutes les 10s
  useEffect(() => {
    if (itemsSlides.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % itemsSlides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [itemsSlides.length]);

  // Header position
  const Header = preference.Header;

  if (!isClient) return null;

  if (itemsSlides.length < 3) return null;

  return (
    <div
      className={`relative w-full h-[87svh] lg:h-[80svh] xl:h-[85svh] 
        overflow-hidden transition-all duration-500 ease-in-out  ${getMyFont?.className}`}
      aria-roledescription="carousel"
      aria-label="Produits en vedette"
    >
      {/* Slides */}
      <div
        className="h-full w-full flex transition-transform duration-700 ease-in-out text-white"
        style={{
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {itemsSlides.map((item, idx) => (
          <div
            className="w-full flex-shrink-0 relative"
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} sur ${itemsSlides.length}`}
            aria-hidden={index !== idx}
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                width={1800}
                height={2000}
                className="object-cover w-full h-full"
                priority={idx === 0}
                style={{
                  borderRadius: preference.buttonRadius,
                }}
              />
            </div>
            {/* Overlay infos */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 to-transparent">
              <div
                className="flex flex-col justify-end px-8
              md:px-10 py-10 gap-8 w-full lg:w-[450px] h-full"
              >
                <h2 className="text-pretty text-3xl lg:text-4xl xl:text-5xl font-bold line-clamp-3 tracking-wide">
                  {item.name && capitalizeText(item.name)}
                </h2>
                <p className="text-sm opacity-80 line-clamp-3">
                  {item.description && capitalizeText(item.description)}
                </p>
                <Link
                  href={`/${shop.slug}/catalogues/${item.id}`}
                  className="font-medium lg:px-10 md:px-8 px-6 py-2 shadow-md transition-all duration-500 
                  ease-in-out hover:opacity-70 flex items-center justify-center gap-2
                  text-sm lg:text-md
                  "
                  style={{
                    textDecoration: "none",
                    backgroundColor: preference.buttonColor,
                    color: preference.buttonTextColor,
                    borderRadius: preference.buttonRadius,
                  }}
                >
                  <span>Acheter</span>

                  {productShop?.promotion && productShop?.promotion !== 0 ? (
                    <span>
                      <s className="opacity-70">
                        {returnFormatedMoney(productShop.price * exchange)}{" "}
                        <span className="text-xs">{currency}</span>
                      </s>
                      {"  "}
                      {"  "}
                      {returnFormatedMoney(
                        totalPriceAfterDiscount * exchange
                      )}{" "}
                      <span className="text-xs">{currency}</span>
                    </span>
                  ) : (
                    <span>
                      {returnFormatedMoney(
                        (productShop?.price || 0) * exchange
                      )}{" "}
                      <span className="text-xs">{currency}</span>
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev/Next Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/70 hover:bg-white shadow rounded-full p-2"
        aria-label="Produit précédent"
      >
        <svg width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M15 19l-7-7 7-7"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/70 hover:bg-white shadow rounded-full p-2"
        aria-label="Produit suivant"
      >
        <svg width="24" height="24" fill="none" aria-hidden="true">
          <path
            d="M9 5l7 7-7 7"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {itemsSlides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              index === i ? "bg-black" : "bg-gray-300"
            }`}
            onClick={() => setIndex(i)}
            aria-label={`Aller à la slide ${i + 1}`}
            aria-current={index === i ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopHero;
