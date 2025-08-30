"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconLikeComponent } from "@/types/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  // const user = useCurrentUser();

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

  // const LinksData =
  //   ShopAllDataLinks[
  //     shop.category as "cosmetiques" | "vetements" | "accessoires"
  //   ] ?? ShopAllDataLinks["cosmetiques"];

  //   MenuIcons

  if (!isClient) return null;

  return (
    <header
      className={`px-4 lg:px-6 xl:px-8 z-50
    w-full 
    transition-all duration-500 ease-in-out
    ${getMyFont?.className}
    overflow-hidden 
`}
      //   style={{
      //     backgroundColor: preference?.background ?? backgroundColors.white,
      //     color: preference?.textColor ?? textColorData.light,
      //   }}
    >
      {/* container */}
      <div
        className={`flex items-center h-14 w-full 
          transition-all duration-500 ease-in-out
      max-w-7xl mx-auto justify-between 
      `}
        // style={{
        //   borderRadius: preference.buttonRadius,
        // }}
      >
        {/* links */}
        <div>
          <Link
            href={`/${shop.slug}`}
            className="flex item-center justify-center gap-2 h-full 
            place-items-center
            
            "
          >
            {preference.logo === "name" ? (
              <h1
                style={{
                  color: preference?.textColor ?? textColorData.light,
                }}
                className="text-md font-bold tracking-tight capitalize line-clamp-1"
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

        {/* icons and btn */}

        <div className="flex items-center gap-2.5">
          {/* cart icon */}
          <Link
            href={`/${shop.slug}/panier`}
            className="flex items-center justify-center "
          >
            <IconCart className="w-8 flex-shrink-0  opacity-75" />
          </Link>

          {/* menu icon */}
          <SheetMenuNav
            IconMenu={IconMenu}
            isOpen={isOpen}
            preferences={preference}
            setIsOpen={setIsOpen}
            shop={shop}
          />
        </div>
      </div>
    </header>
  );
};

type SheetMenuNavType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shop: Shop;
  preferences: Preferences;
  IconMenu: IconLikeComponent;
};

const SheetMenuNav = ({
  isOpen,
  setIsOpen,
  shop,
  preferences,
  IconMenu,
}: SheetMenuNavType) => {
  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  const user = useCurrentUser();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          type="button"
        >
          {isOpen ? (
            <X
              size={24}
              color={preferences.textColor}
              className="transition-transform"
            />
          ) : (
            <IconMenu
              className="text-current"
              style={{
                borderRadius: preferences.buttonRadius,
                borderColor: preferences.textColor,
                color: preferences.textColor,
              }}
              aria-hidden="true"
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-72 max-w-full p-6 overflow-auto max-h-[80vh] rounded-lg border border-gray-200 shadow-lg bg-white dark:bg-gray-900 dark:border-gray-700"
      >
        <header className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {capitalizeText(shop.name)}
          </h3>
          {shop.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {capitalizeText(shop.description)}
            </p>
          )}
        </header>

        <Separator className="my-4" />

        <nav
          className="flex flex-col gap-3"
          aria-label="Menu de navigation boutique"
        >
          <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">
            MENU
          </h4>

          {LinksData.map((lk, idx) => (
            <Link
              key={idx}
              href={`/${shop.slug}${lk.value}`}
              className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              {lk.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {user ? (
            <div className="flex items-center gap-3">
              <AvatarUser />
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                  {user?.name && capitalizeText(user.name)}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {user?.email}
                </p>
              </div>
            </div>
          ) : (
            <AuthPopup />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShopHeader;
