"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  backgroundColors,
  CartIcons,
  MenuIcons,
  textColorData,
} from "@/utils/preferences";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import AvatarUser from "@/components/AvatarUser";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import { ShopAllDataLinks } from "@/utils/shopData";
import { ShopHeaderType } from "../first/ShopHeader";
import { cn } from "@/lib/utils";

const ShopHeader = ({
  shop,
  getMyFont,
  preferences: preference,
}: ShopHeaderType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  // update favicon
  useEffect(() => {
    const updateFavicon = (iconURL: string): void => {
      let favicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = iconURL;
    };

    if (shop.logo) updateFavicon(shop.logo);
  }, [shop]);

  const IconCart = useMemo(
    () => CartIcons[preference.cartIcon ? parseInt(preference.cartIcon) : 0],
    [preference.cartIcon]
  );

  const IconMenu = useMemo(
    () => MenuIcons[preference.menuIcon ? parseInt(preference.menuIcon) : 0],
    [preference.menuIcon]
  );

  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preference.background),
    [preference.background]
  );

  // Amélioration du Glassmorphism pour le menu
  const bgGlass =
    bgIsLightOrDark === "light"
      ? "bg-white/95 backdrop-blur-2xl"
      : "bg-black/90 backdrop-blur-2xl";

  if (!isClient) return null;

  return (
    <header
      className={`px-6 lg:px-12 z-100 h-20 fixed top-0 left-0 right-0 transition-all duration-500 flex items-center ${getMyFont?.className}`}
      style={{
        backgroundColor: preference?.background ?? backgroundColors.white,
        color: preference?.textColor ?? textColorData.light,
      }}
    >
      <div className="flex items-center justify-between w-full max-w-[1800px] mx-auto">
        {/* Logo - Plus imposant */}
        <Link
          href={`/${shop.slug}`}
          className="relative z-110 transition-transform active:scale-95"
        >
          {preference.logo === "name" ? (
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              {shop.name}
            </h1>
          ) : (
            <div
              className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden border border-black/5"
              style={{ borderRadius: preference.buttonRadius }}
            >
              <Image
                src={shop.logo}
                alt={shop.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </Link>

        {/* Actions - Style minimaliste */}
        <div className="flex items-center gap-2 md:gap-6 relative z-110">
          <Link
            href={`/${shop.slug}/panier`}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <IconCart className="w-6 h-6" />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 border 
            border-current rounded-full 
            transition-all duration-300 
            ${bgIsLightOrDark === "dark" ? "hover:bg-black hover:text-white" : "hover:bg-white hover:text-black"} 
            active:scale-95
            `}
            style={{ borderColor: `${preference.textColor}40` }}
          >
            <span className="text-xs font-bold uppercase hidden md:block">
              {isOpen ? "Fermer" : "Menu"}
            </span>
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <IconMenu className="w-fit h-fit" />
            )}
          </button>
        </div>

        {/* Overlay Menu - Animation Slide Down */}
        <div
          className={cn(
            "fixed inset-0 z-100 transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]",
            isOpen ? "translate-y-0" : "-translate-y-full",
            bgGlass
          )}
        >
          <MenuNavHeader
            setIsOpen={setIsOpen}
            preferences={preference}
            shop={shop}
            bgIsLightOrDark={bgIsLightOrDark}
            getMyFont={getMyFont}
          />
        </div>
      </div>
    </header>
  );
};

type MenuNavHeaderType = ShopHeaderType & {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bgIsLightOrDark: "dark" | "light";
};

const MenuNavHeader = ({
  shop,
  preferences: preference,
  setIsOpen,
  bgIsLightOrDark,
}: MenuNavHeaderType) => {
  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  const user = useCurrentUser();

  // Couleurs dynamiques basées sur le fond
  const contrastColor =
    bgIsLightOrDark === "dark" ? "text-white" : "text-black";
  const mutedColor =
    bgIsLightOrDark === "dark" ? "text-white/50" : "text-black/50";

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-6 pt-32 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
        {/* Navigation Section */}
        <div className="space-y-8">
          <p
            className={`text-xs font-bold uppercase tracking-[0.3em] ${mutedColor}`}
          >
            Explorez la collection
          </p>
          <nav className="flex flex-col space-y-4 md:space-y-6">
            {LinksData.map((lk, idx) => (
              <Link
                href={`/${shop.slug}${lk.value}`}
                key={idx}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-4xl md:text-6xl font-bold tracking-tighter transition-all duration-300 hover:pl-4 flex items-center group",
                  contrastColor
                )}
              >
                {lk.label}
                <ArrowRight className="ml-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all w-8 h-8 md:w-12 md:h-12" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Info & Profile Section */}
        <div className="flex flex-col justify-between border-l border-current/10 pl-0 lg:pl-12">
          <div className="space-y-6">
            <p
              className={`text-xs font-bold uppercase tracking-[0.3em] ${mutedColor}`}
            >
              Votre Compte
            </p>
            {user ? (
              <div className="group cursor-pointer p-6 rounded-2xl bg-current/5 hover:bg-current/10 transition-colors">
                <div className="flex items-center gap-4">
                  <AvatarUser />
                  <div>
                    <p className={`font-bold text-lg ${contrastColor}`}>
                      {user?.name && capitalizeText(user?.name)}
                    </p>
                    <p className={`text-sm ${mutedColor}`}>{user?.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="scale-125 origin-left py-4">
                <AuthPopup />
              </div>
            )}
          </div>

          {/* Shop Card */}
          <div className="hidden lg:block relative aspect-video overflow-hidden rounded-3xl group">
            <Image
              src={shop.logo}
              alt="shop"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-2xl font-bold uppercase italic">
                {shop.name}
              </h3>
              <p className="text-sm opacity-70">
                Découvrez l'univers unique de notre boutique.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="my-12 opacity-10" /> */}
    </div>
  );
};

export default ShopHeader;
