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

  // update logo
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

  //   MenuIcons

  if (!isClient) return null;

  return (
    <header
      className={`px-4 lg:px-6 xl:px-8 z-50
        ${isOpen ? "md:h-96 h-[84svh]" : "h-14"} shadow
        fixed top-0 left-0 right-0 
        transition-all duration-500 ease-in-out
        ${getMyFont?.className}
        overflow-hidden 
    `}
      style={{
        backgroundColor: preference?.background ?? backgroundColors.white,
        color: preference?.textColor ?? textColorData.light,
      }}
    >
      {/* container */}
      <div className="flex flex-col w-full transition-all duration-500 ease-in-out">
        {/* Top */}
        <div
          className={`flex items-center justify-between gap-4 w-full
         h-14
            `}
        >
          {/* part 1 */}
          <div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Ouvrir le menu"
            >
              {isOpen ? <X /> : <IconMenu />}
            </button>
          </div>

          {/* part 2 */}
          <div>
            <Link
              href={`/${shop.slug}`}
              className="flex item-center justify-center gap-2 h-full place-items-center"
            >
              {preference.logo === "name" ? (
                <h1
                  style={{
                    color: preference?.textColor ?? textColorData.light,
                  }}
                  className="text-2xl font-light font-serif tracking-wide capitalize"
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
          </div>

          {/* part 3 */}
          <div>
            <Link
              href={`/${shop.slug}/panier`}
              className="flex items-center justify-center "
            >
              <IconCart className="w-8 flex-shrink-0  opacity-75" />
            </Link>
          </div>
        </div>

        {/* bottom */}
        <div className="mt-4 flex md:flex-row flex-col md:gap-4 md:items-center justify-between">
          {/* links */}
          <div className="flex flex-col gap-2.5">
            {LinksData.map((lk, idx) => (
              <Link
                href={`/${shop.slug}${lk.value}`}
                key={idx}
                onClick={() => setIsOpen(false)}
              >
                <span className="font-medium">{lk.label}</span>
              </Link>
            ))}
          </div>

          {/* image and title */}
          <div className="py-4 md:px-4 w-full md:w-fit">
            <Separator className="md:hidden my-4 bg-gray-500" />
            <div className="text-sm">
              Boutique <strong className="capitalize">{shop.name}</strong>
            </div>
            <Image
              src={shop.logo}
              alt="Logo de la boutique"
              width={600}
              height={600}
              priority
              className={`w-full h-40 md:h-32 object-cover
              transition-all duration-500 ease-in-out border
              mt-1 border-gray-500
              `}
              style={{
                borderRadius: preference.buttonRadius,
              }}
            />

            {/* auth and btn */}
            <div className="mt-4 w-full flex flex-col ">
              {user ? (
                <div className="flex items-center gap-2.5 w-full">
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
      </div>
    </header>
  );
};

export default ShopHeader;
