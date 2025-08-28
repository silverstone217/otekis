"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
import Image from "next/image";
import { ShopAllDataLinks } from "@/utils/shopData";
import { LucideProps, X } from "lucide-react";
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
    pt-4
    fixed top-0 left-0 right-0 
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
        className={`flex items-center h-14 shadow w-full transition-all duration-500 ease-in-out
      max-w-sm mx-auto border px-4 justify-between backdrop-blur-2xl 
      ${shop.cover && "bg-white/20"}
      `}
        style={{
          borderRadius: preference.buttonRadius,
        }}
      >
        {/* links */}
        <div>
          <Link
            href={`/${shop.slug}`}
            className="flex item-center justify-center gap-2 h-full place-items-center
            
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
  IconMenu: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Ouvrir le menu">
          {isOpen ? <X /> : <IconMenu />}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full h-svh overflow-y-auto overflow-x-hidden ">
        <SheetHeader>
          <SheetTitle>{capitalizeText(shop.name)}</SheetTitle>
          <SheetDescription
            hidden={shop.description ? false : true}
            className="line-clamp-2"
          >
            {capitalizeText(shop.description)}
          </SheetDescription>
        </SheetHeader>

        {/* separ */}
        <Separator className="bg-gray-500 w-full my-4" />

        {/* content */}
        <div className="w-full flex flex-col gap-4 px-4">
          <h2 className="font-bold text-lg">MENU</h2>

          {/* Links */}
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

          {/* auth btn */}
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
      </SheetContent>
    </Sheet>
  );
};

export default ShopHeader;
