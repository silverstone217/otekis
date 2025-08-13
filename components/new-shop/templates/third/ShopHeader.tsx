"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ShopTemplateType } from "../first/FirstShopTemplate";
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
import { Separator } from "@/components/ui/separator";
import { capitalizeText } from "@/utils/shopFunctions";
import { ShopHeaderType } from "../first/ShopHeader";

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
    () => CartIcons[preference.cartIcon ? parseInt(preference.cartIcon) : 0],
    [preference.cartIcon]
  );

  const IconMenu = useMemo(
    () => MenuIcons[preference.menuIcon ? parseInt(preference.menuIcon) : 0],
    [preference.menuIcon]
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
        ${"h-16"} shadow
        fixed top-0 left-0 right-0 
        transition-all duration-500 ease-in-out
        ${getMyFont?.className}
        overflow-hidden 
        flex items-center
    `}
      style={{
        backgroundColor: preference?.background ?? backgroundColors.white,
        color: preference?.textColor ?? textColorData.light,
      }}
    >
      {/* container */}
      <div className="flex relative items-center justify-between w-full transition-all duration-500 ease-in-out">
        {/* Top */}

        {/* logo */}
        <div className="flex items-center gap-4 justify-start">
          <Link
            href={`/${shop.slug}`}
            className="flex item-center justify-center gap-2 h-full place-items-center"
          >
            {preference.logo === "name" ? (
              <h1
                style={{
                  color: preference?.textColor ?? textColorData.light,
                }}
                className="text-xl font-bold tracking-wide capitalize"
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

        {/* cart and menu */}
        <div className="flex items-center gap-4 justify-start">
          {/* cart */}
          <Link
            href={`/${shop.slug}/panier`}
            className="flex items-center justify-center "
          >
            <IconCart className="w-8 flex-shrink-0  opacity-75" />
          </Link>

          {/* menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Ouvrir le menu"
          >
            {isOpen ? <X /> : <IconMenu />}
          </button>
        </div>

        {/* div absolute for nav menu links and btn auth */}
        <div
          className={`fixed z-50 top-[calc(5rem + 24px)] left-0 right-0 bottom-0
       h-[calc(100vh-4rem)]  backdrop-blur-2xl 
       ${preference.background === "#ffffff" ? "bg-white/50" : "bg-black/50"}
      ${
        isOpen ? "flex" : "hidden"
      } md:p-4 lg:p-6  overflow-x-hidden overflow-y-auto md:overflow-y-hidden
      transition-all duration-500 ease-in-out
    `}
        >
          <MenuNavHeader
            getMyFont={getMyFont}
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

export default ShopHeader;

type MenuNavHeaderType = ShopHeaderType & {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MenuNavHeader = ({
  shop,
  getMyFont,
  preferences: preference,
  isOpen,
  setIsOpen,
}: MenuNavHeaderType) => {
  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  const user = useCurrentUser();

  return (
    <div
      className=" md:h-5/6 flex md:flex-row flex-col gap-4
    w-full p-4 lg:p-6 md:shadow-lg md:border-b
    "
      style={{
        borderRadius: preference.buttonRadius,
      }}
    >
      {/* links */}
      <div className="flex flex-col w-full">
        <h2
          className="font-bold text-xl tracking-tight w-fit"
          onClick={() => setIsOpen(false)}
          aria-label="Fermer le menu"
        >
          MENU
        </h2>
        <Separator className="my-2.5" />
        {/* links */}
        <nav className="flex-shrink-0 md:flex-1 max-w-lg">
          <div className="flex flex-col gap-2.5 md:grid grid-cols-2 md:gap-4 lg:grid-cols-3">
            {LinksData.map((lk, idx) => (
              <Link
                href={`/${shop.slug}${lk.value}`}
                key={idx}
                onClick={() => setIsOpen(false)}
              >
                <span className="font-semibold text-lg">{lk.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* auth */}
        <div className="gap-2.5 md:flex flex-col hidden">
          {/* btn */}

          {user ? (
            <div className="flex items-center gap-2.5">
              <AvatarUser />
              <div>
                <p className="font-medium line-clamp-1">
                  {user?.name && capitalizeText(user?.name)}
                </p>
                <p className="opacity-75 text-xs line-clamp-1">{user?.email}</p>
              </div>
            </div>
          ) : (
            <AuthPopup />
          )}
        </div>
      </div>

      {/* auth btn */}
      {/* auth */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {/* btn */}
        <Separator className="my-2.5" />
        {user ? (
          <div className="flex items-center gap-2.5">
            <AvatarUser />
            <div>
              <p className="font-medium line-clamp-1">
                {user?.name && capitalizeText(user?.name)}
              </p>
              <p className="opacity-75 text-xs line-clamp-1">{user?.email}</p>
            </div>
          </div>
        ) : (
          <AuthPopup />
        )}
      </div>
    </div>
  );
};
