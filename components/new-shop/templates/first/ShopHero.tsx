"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Preferences,
  Product,
  ProductShop,
  Shop,
} from "@/lib/generated/prisma/client";
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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Text_position = preference.positionText as "center" | "hidden";

  const imgCover = shop.cover
    ? shop.cover
    : shop.category === "cosmetiques"
      ? coverImg2
      : coverImg;

  return (
    <section
      className={cn(
        "w-full h-[90svh] lg:h-[85svh] relative overflow-hidden flex items-center justify-center bg-black",
        getMyFont?.className
      )}
    >
      {/* BACKGROUND IMAGE - PARALLAXE ACCENTUÉ */}
      <div
        className="absolute inset-0 z-0"
        style={{
          // L'image descend à 50% de la vitesse du scroll
          transform: `translateY(${scrollY * 0.5}px) scale(${1.1 + scrollY * 0.0002})`,
          willChange: "transform",
        }}
      >
        <Image
          src={imgCover}
          alt={shop.name}
          fill
          priority
          className="object-cover"
          unoptimized={!!shop.cover}
        />
        {/* Overlay progressif pour la profondeur et le contraste */}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70" />
      </div>

      {/* CONTENU TEXTE - EFFET FLOTTANT */}
      {Text_position === "center" && (
        <div
          className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center text-center transition-opacity duration-300"
          style={{
            // Le texte remonte légèrement et s'efface au scroll
            transform: `translateY(-${scrollY * 0.15}px)`,
            opacity: Math.max(0, 1 - scrollY / 600),
          }}
        >
          {/* Badge */}
          <span className="mb-6 px-4 py-1.5 border border-white/30 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-white animate-in fade-in slide-in-from-bottom-2 duration-1000">
            Collection {new Date().getFullYear()}
          </span>

          {/* Titre avec animation par mots */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-6 max-w-4xl text-balance uppercase italic">
            {preference.title?.split(" ").map((word, i) => (
              <span
                key={i}
                className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {word}&nbsp;
              </span>
            ))}
          </h2>

          <p className="text-white/90 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light opacity-80 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            {preference.description}
          </p>

          {/* Indicateur de Scroll */}
          <div className="absolute bottom-[-15vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 lg:flex">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white rotate-90 mb-8">
              Scroll
            </span>
            <div className="w-px h-16 bg-linear-to-b from-white to-transparent" />
          </div>
        </div>
      )}

      {/* DÉCORATIONS LATÉRALES */}
      <div className="absolute bottom-10 left-10 z-10 hidden lg:block">
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] -rotate-90 origin-left border-l border-white/20 pl-4">
          {shop.category} // {shop.name}
        </p>
      </div>

      <div className="absolute bottom-10 right-10 z-10 hidden lg:block">
        <div className="flex flex-col gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </section>
  );
};

export default ShopHero;
