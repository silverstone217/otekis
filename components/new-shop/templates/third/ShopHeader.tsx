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
import { X } from "lucide-react";
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import AvatarUser from "@/components/AvatarUser";
import { Separator } from "@/components/ui/separator";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import { ShopAllDataLinks } from "@/utils/shopData";
import { ShopHeaderType } from "../first/ShopHeader";

const ShopHeader = ({
  shop,
  getMyFont,
  preferences: preference,
}: ShopHeaderType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  // update logo in favicon
  useEffect(() => {
    if (!shop.logo) return;
    const updateFavicon = (iconURL: string) => {
      let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = iconURL;
    };
    updateFavicon(shop.logo);
  }, [shop.logo]);

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

  const bgGlass =
    bgIsLightOrDark === "light"
      ? "bg-black/30 backdrop-blur-xl"
      : "bg-white/20 backdrop-blur-xl";

  if (!isClient) return null;

  return (
    <header
      className={`px-4 lg:px-6 xl:px-8 z-50 h-16 shadow fixed top-0 left-0 right-0 
        transition-all duration-500 ease-in-out flex items-center`}
      style={{
        backgroundColor: preference?.background ?? backgroundColors.white,
        color: preference?.textColor ?? textColorData.light,
      }}
    >
      <div className="flex relative items-center justify-between w-full">
        {/* Logo */}
        <Link href={`/${shop.slug}`} className="flex items-center gap-2 h-full">
          {preference.logo === "name" ? (
            <h1
              style={{ color: preference?.textColor ?? textColorData.light }}
              className="text-xl font-bold tracking-wide capitalize"
            >
              {shop.name}
            </h1>
          ) : (
            <Image
              src={shop.logo}
              alt={shop.name}
              width={40}
              height={40}
              priority
              className="w-8 h-8 object-cover"
              style={{ borderRadius: preference.buttonRadius }}
            />
          )}
        </Link>

        {/* Cart + Menu */}
        <div className="flex items-center gap-4">
          <Link href={`/${shop.slug}/panier`}>
            <IconCart className="w-7 opacity-80 hover:opacity-100 transition" />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Ouvrir le menu"
            className="p-2 rounded-md hover:bg-black/10 transition"
          >
            {isOpen ? <X /> : <IconMenu />}
          </button>
        </div>

        {/* Nav Menu */}
        {/* Nav Menu */}
        <div
          className={`fixed top-16 left-0 right-0 bottom-0 z-40 transform transition-all duration-500 ease-in-out
    ${
      isOpen
        ? "translate-y-0 opacity-100 pointer-events-auto"
        : "-translate-y-full opacity-0 pointer-events-none"
    }
    ${bgGlass}`}
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

export default ShopHeader;

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
  const textColor =
    bgIsLightOrDark === "dark" ? "text-slate-900" : "text-slate-100";

  return (
    <div
      className={`flex flex-col md:flex-row gap-6 w-full h-full p-6 
        md:p-8 overflow-y-auto ${textColor}`}
      style={{ borderRadius: preference.buttonRadius }}
    >
      {/* Sticky Menu Title */}
      <div className="sticky top-0 bg-transparent backdrop-blur-xl pb-3 z-10 px-1">
        <h2
          className="font-bold text-xl tracking-tight cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          MENU
        </h2>
        <Separator
          className={`my-2.5 ${
            bgIsLightOrDark === "dark" ? "bg-gray-500" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Links */}
      <nav className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LinksData.map((lk, idx) => (
            <Link
              href={`/${shop.slug}${lk.value}`}
              key={idx}
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg font-medium text-lg 
              hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out
              hover:bg-black/10"
            >
              {lk.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User / Auth */}
      <div className="mt-auto flex flex-col gap-4">
        <Separator
          className={`${
            bgIsLightOrDark === "dark" ? "bg-gray-500" : "bg-gray-300"
          }`}
        />
        {user ? (
          <div className="flex items-center gap-3">
            <AvatarUser />
            <div>
              <p className="font-semibold line-clamp-1">
                {user?.name && capitalizeText(user?.name)}
              </p>
              <p className="opacity-70 text-sm line-clamp-1">{user?.email}</p>
            </div>
          </div>
        ) : (
          <AuthPopup />
        )}
      </div>
    </div>
  );
};
