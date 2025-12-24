"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
import Image from "next/image";
import { ShopAllDataLinks } from "@/utils/shopData";
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import AvatarUser from "@/components/AvatarUser";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { capitalizeText } from "@/utils/shopFunctions";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

export type ShopHeaderType = {
  shop: Shop;
  preferences: Preferences;
  getMyFont: NextFontWithVariable;
};

const ShopHeader = ({
  shop,
  getMyFont,
  preferences: preference,
}: ShopHeaderType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const user = useCurrentUser();

  useEffect(() => setIsClient(true), []);

  // update favicon and title
  useEffect(() => {
    if (!shop) return;

    // 1. Mettre à jour le TITRE de la page
    if (shop.name) {
      document.title = `${shop.name} | Boutique Officielle`;
    }

    // 2. Mettre à jour le FAVICON
    const updateFavicon = (iconURL: string): void => {
      // Chercher tous les types de favicon possibles (icon, shortcut icon, apple-touch-icon)
      const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]'];
      let faviconFound = false;

      selectors.forEach((selector) => {
        const element = document.querySelector(selector) as HTMLLinkElement;
        if (element) {
          element.href = iconURL;
          faviconFound = true;
        }
      });

      // Si aucun n'existe, on le crée
      if (!faviconFound) {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = iconURL;
        document.head.appendChild(newFavicon);
      }
    };

    if (shop.logo) {
      updateFavicon(shop.logo);
    }
  }, [shop.logo, shop.name]);

  const IconCart = useMemo(
    () => CartIcons[preference?.cartIcon ? parseInt(preference.cartIcon) : 0],
    [preference?.cartIcon]
  );

  const IconMenu = useMemo(
    () => MenuIcons[preference?.menuIcon ? parseInt(preference.menuIcon) : 0],
    [preference?.menuIcon]
  );

  if (!isClient) return null;

  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-100 p-4 md:p-6 transition-all duration-500",
        getMyFont?.className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* BARRE PRINCIPALE */}
        <div
          className="w-full h-16 flex items-center justify-between px-6 transition-all duration-500 border-b md:border md:rounded-full backdrop-blur-md"
          style={{
            backgroundColor: `${preference.background}CC`, // Transparent
            color: preference.textColor,
            borderColor: `${preference.textColor}1A`, // 10% d'opacité
            borderRadius: preference.buttonRadius === "0px" ? "0px" : "9999px",
          }}
        >
          {/* GAUCHE : Bouton Menu Minimal */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 group overflow-hidden"
          >
            <div className="relative w-fit h-fit flex items-center justify-center">
              {isOpen ? (
                <Minus className="absolute animate-in spin-in-90 duration-300 w-5 h-5" />
              ) : (
                <IconMenu size={20} />
              )}
            </div>
            <span className="text-[10px] ml-0.5 font-bold uppercase tracking-[0.2em] hidden md:block">
              {isOpen ? "Close" : ""}
            </span>
          </button>

          {/* CENTRE : Logo */}
          <Link
            href={`/${shop.slug}`}
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
          >
            {preference.logo === "name" ? (
              <h1 className="text-lg font-light tracking-[0.3em] uppercase transition-letter-spacing duration-500 hover:tracking-[0.5em]">
                {shop.name}
              </h1>
            ) : (
              <Image
                src={shop.logo}
                alt={shop.name}
                width={40}
                height={40}
                className="w-9 h-9 object-contain grayscale hover:grayscale-0 transition-all"
              />
            )}
          </Link>

          {/* DROITE : Panier & Profil */}
          <div className="flex items-center gap-4">
            {user && (
              <Link
                href={`/${shop.slug}/profil`}
                className="hidden md:block scale-75 hover:scale-90 transition-transform"
              >
                <AvatarUser />
              </Link>
            )}
            <Link href={`/${shop.slug}/panier`} className="relative group">
              <IconCart className="w-5 h-5 transition-transform group-hover:-rotate-12" />
            </Link>
          </div>
        </div>

        {/* MENU DÉROULANT (CONTENU) */}
        <div
          className={cn(
            "w-[98%] max-w-4xl fixed top-24 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-[90]",
            isOpen
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "-translate-y-4 opacity-0 pointer-events-none"
          )}
        >
          <div
            className="rounded-4xl border backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: preference.background,
              color: preference.textColor,
              borderColor: `${preference.textColor}1A`,
              borderRadius: preference.buttonRadius,
              // On définit une hauteur maximale dynamique pour que le scroll interne s'active
              maxHeight: "calc(100vh - 140px)",
            }}
          >
            {/* Conteneur interne scrollable */}
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Liens */}
                <nav className="flex flex-col gap-4">
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-[.3em] mb-2">
                    Explore
                  </p>
                  {LinksData.map((lk, i) => (
                    <Link
                      key={i}
                      href={`/${shop.slug}${lk.value}`}
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-light hover:italic hover:pl-2 transition-all duration-300"
                    >
                      {lk.label}
                    </Link>
                  ))}
                </nav>

                {/* Infos / Auth */}
                <div className="flex flex-col justify-between py-2 border-t md:border-t-0 md:border-l border-current/10 md:pl-12 pt-8 md:pt-0">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-[.3em]">
                      Boutique
                    </p>
                    <h2 className="text-3xl font-bold italic capitalize leading-none">
                      {shop.name}
                    </h2>
                    <p className="text-sm opacity-60 font-light leading-relaxed max-w-xs">
                      {shop.description ||
                        "Une expérience shopping unique sélectionnée pour vous."}
                    </p>
                  </div>

                  <div className="mt-12">
                    {user ? (
                      <div className="flex items-center gap-4 p-4 rounded-full bg-current/5 border border-current/5">
                        <AvatarUser />
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs truncate uppercase tracking-widest">
                            {user.name}
                          </p>
                          <p className="text-[10px] opacity-50 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <AuthPopup />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
