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
import { ShopAllDataLinks } from "@/utils/shopData";
import { X, ShoppingBag } from "lucide-react"; // Ajout de ShoppingBag au cas où
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import AvatarUser from "@/components/AvatarUser";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Separator } from "@/components/ui/separator";
import { capitalizeText } from "@/utils/shopFunctions";

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

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    () => CartIcons[preference?.cartIcon ? parseInt(preference.cartIcon) : 0],
    [preference?.cartIcon]
  );

  const IconMenu = useMemo(
    () => MenuIcons[preference?.menuIcon ? parseInt(preference.menuIcon) : 0],
    [preference?.menuIcon]
  );

  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  if (!isClient) return null;

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <header
        className={`fixed top-0 left-0 right-0 z-60 h-16 transition-all duration-300 ${getMyFont?.className} 
        border-b border-white/10 backdrop-blur-md`}
        style={{
          backgroundColor: `${preference?.background ?? backgroundColors.white}ee`, // Ajout d'une légère transparence
          color: preference?.textColor ?? textColorData.light,
        }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          {/* Gauche : Menu Toggle */}
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -ml-2 hover:bg-black/5 transition-colors duration-200"
              style={{ borderRadius: preference.buttonRadius }}
            >
              {isOpen ? (
                <X className="w-6 h-6 animate-in fade-in zoom-in duration-300" />
              ) : (
                <IconMenu className="w-fit h-6 transition-transform active:scale-90" />
              )}
            </button>
          </div>

          {/* Centre : Logo (Plus grand et centré) */}
          <div className="flex-2 flex justify-center">
            <Link
              href={`/${shop.slug}`}
              className="group transition-transform duration-300 hover:scale-105"
            >
              {preference.logo === "name" ? (
                <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase italic">
                  {shop.name}
                </h1>
              ) : (
                <div
                  className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden"
                  style={{ borderRadius: preference.buttonRadius }}
                >
                  <Image
                    src={shop.logo}
                    alt={shop.name}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              )}
            </Link>
          </div>

          {/* Droite : Panier & Auth (Desktop) */}
          <div className="flex-1 flex items-center justify-end gap-4">
            <Link
              href={`/${shop.slug}/panier`}
              className="relative p-2 hover:bg-black/5 transition-all"
              style={{ borderRadius: preference.buttonRadius }}
            >
              <IconCart className="w-6 h-6" />
              {/* Badge optionnel si vous avez un state panier */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
          </div>
        </div>
      </header>

      {/* MENU OVERLAY (FULLSCREEN MODERN) */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop sombre */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Contenu du Menu */}
        <nav
          className={`absolute top-0 left-0 w-full md:w-[400px] h-full shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.67,0)] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            backgroundColor: preference?.background ?? backgroundColors.white,
            color: preference?.textColor ?? textColorData.light,
          }}
        >
          <div className="flex flex-col h-full pt-20 p-8">
            {/* Liens de navigation avec animation décalée */}
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-bold">
                Navigation
              </p>
              <div className="flex flex-col gap-4">
                {LinksData.map((lk, idx) => (
                  <Link
                    href={`/${shop.slug}${lk.value}`}
                    key={idx}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-light hover:translate-x-2 transition-transform duration-300 block"
                  >
                    {lk.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-8">
              <Separator className="opacity-10" />

              {/* User Section */}
              <div className="py-4">
                {user ? (
                  <div className="flex items-center gap-4 p-3 bg-black/5 rounded-xl">
                    <AvatarUser />
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate">
                        {user?.name && capitalizeText(user?.name)}
                      </p>
                      <p className="text-xs opacity-60 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="scale-110 origin-left">
                    <AuthPopup />
                  </div>
                )}
              </div>

              {/* Shop Footer Info */}
              <div className="flex items-center gap-4 pb-8">
                <div
                  className="relative w-12 h-12 shrink-0 border border-black/10"
                  style={{ borderRadius: preference.buttonRadius }}
                >
                  <Image
                    src={shop.logo}
                    alt="logo"
                    fill
                    className="object-cover p-1"
                  />
                </div>
                <div>
                  <p className="text-xs opacity-50 uppercase tracking-widest">
                    Boutique Officielle
                  </p>
                  <p className="font-bold capitalize">{shop.name}</p>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer pour éviter que le contenu passe sous le header fixe */}
      <div className="h-16" />
    </>
  );
};

export default ShopHeader;
