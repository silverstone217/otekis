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
import { X } from "lucide-react";
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import AvatarUser from "@/components/AvatarUser";
import { Preferences, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Separator } from "@/components/ui/separator";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";

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

  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preference.background),
    [preference.background]
  );

  if (!isClient) return null;

  return (
    <>
      {/* HEADER FIXE */}
      <header
        className={`px-4 lg:px-6 xl:px-8 z-50
        h-14 shadow
        fixed top-0 left-0 right-0 
        transition-all duration-500 ease-in-out
        ${getMyFont?.className}
        flex items-center justify-between`}
        style={{
          backgroundColor: preference?.background ?? backgroundColors.white,
          color: preference?.textColor ?? textColorData.light,
        }}
      >
        {/* bouton menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ouvrir le menu"
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <IconMenu
              className="w-7 h-7"
              style={{
                borderRadius: preference.buttonRadius,
                color: preference.textColor,
              }}
            />
          )}
        </button>

        {/* logo */}
        <Link
          href={`/${shop.slug}`}
          className="flex items-center justify-center gap-2"
        >
          {preference.logo === "name" ? (
            <h1
              style={{
                color: preference?.textColor ?? textColorData.light,
              }}
              className="text-xl font-semibold tracking-wide capitalize"
            >
              {shop.name}
            </h1>
          ) : (
            <Image
              src={shop.logo}
              alt={shop.name}
              width={800}
              height={800}
              priority
              className="w-8 h-8 object-cover"
              style={{
                borderRadius: preference.buttonRadius,
              }}
            />
          )}
        </Link>

        {/* panier */}
        <Link
          href={`/${shop.slug}/panier`}
          className="flex items-center justify-center"
        >
          <IconCart className="w-7 h-7 opacity-75" />
        </Link>
      </header>

      {/* MENU OVERLAY */}
      <div
        className={`fixed top-14 left-0 right-0 bottom-0 z-40
        transition-all duration-500 ease-in-out
        ${
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }
        `}
        style={{
          backgroundColor: preference?.background ?? backgroundColors.white,
          color: preference?.textColor ?? textColorData.light,
        }}
      >
        <div className="p-4 flex flex-col gap-6 overflow-y-auto">
          {/* liens */}
          <div className="flex flex-col gap-3">
            {LinksData.map((lk, idx) => (
              <Link
                href={`/${shop.slug}${lk.value}`}
                key={idx}
                onClick={() => setIsOpen(false)}
                className="font-medium text-lg hover:opacity-80 transition"
              >
                {lk.label}
              </Link>
            ))}
          </div>

          <Separator className="bg-gray-500" />

          {/* infos shop */}
          <div className="flex flex-col gap-3">
            <div className="text-sm">
              Boutique <strong className="capitalize">{shop.name}</strong>
            </div>
            <Image
              src={shop.logo}
              alt="Logo de la boutique"
              width={600}
              height={600}
              priority
              className="w-full h-40 object-cover border border-gray-500"
              style={{
                borderRadius: preference.buttonRadius,
              }}
            />
          </div>

          <Separator className="bg-gray-500" />

          {/* auth */}
          <div className="mt-2">
            {user ? (
              <div className="flex items-center gap-2.5">
                <AvatarUser />
                <div>
                  <p className="font-medium line-clamp-1">
                    {user?.name && capitalizeText(user?.name)}
                  </p>
                  <p className="opacity-75 text-xs line-clamp-1">
                    {user?.email}
                  </p>
                </div>
              </div>
            ) : (
              <AuthPopup />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopHeader;
