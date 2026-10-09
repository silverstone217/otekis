"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
import Image from "next/image";
import { ShopAllDataLinks } from "@/utils/shopData";
import { X, ChevronRight, LayoutGrid } from "lucide-react";
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import AvatarUser from "@/components/AvatarUser";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { Separator } from "@/components/ui/separator";
import { capitalizeText } from "@/utils/shopFunctions";
import { IconLikeComponent } from "@/types/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import NBGButton from "../../special-templates/NBGButton";

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

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    [preference?.cartIcon],
  );

  const IconMenu = useMemo(
    () => MenuIcons[preference?.menuIcon ? parseInt(preference.menuIcon) : 0],
    [preference?.menuIcon],
  );

  if (!isClient) return null;

  return (
    <header
      className={cn(
        "z-100 w-full transition-all duration-300 h-16 flex items-center border-b border-black/5",
        getMyFont?.className,
      )}
      style={{
        backgroundColor: preference?.background || "#ffffff",
        color: preference?.textColor || textColorData.light,
      }}
    >
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-between">
        {/* LOGO SECTION */}
        <Link href={`/${shop.slug}`} className="flex items-center gap-3 group">
          {preference.logo === "name" ? (
            <h1
              className="text-lg font-extrabold tracking-tight uppercase 
            leading-none line-clamp-1"
            >
              {shop.name}
            </h1>
          ) : (
            <div
              className="relative w-9 h-9 overflow-hidden ring-1 ring-black/5 group-hover:scale-105 transition-transform"
              style={{ borderRadius: preference.buttonRadius }}
            >
              <Image
                src={shop.logo}
                alt={shop.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </Link>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <Link
            href={`/${shop.slug}/panier`}
            className="p-2 hover:bg-black/3 transition-colors relative group"
            style={{ borderRadius: preference.buttonRadius }}
          >
            <IconCart className="w-6 h-6 opacity-80 group-hover:opacity-100" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Link>

          <Separator orientation="vertical" className="h-4 mx-1 opacity-20" />

          {/* MENU POPOVER */}
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

/* --- POPOVER CONTENT AMÉLIORÉ --- */
const SheetMenuNav = ({
  isOpen,
  setIsOpen,
  shop,
  preferences,
  IconMenu,
}: any) => {
  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  const user = useCurrentUser();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 p-2 hover:bg-black/3 transition-all group"
          style={{ borderRadius: preferences.buttonRadius }}
        >
          <div className="relative overflow-hidden">
            {isOpen ? (
              <X size={20} className="animate-in fade-in zoom-in" />
            ) : (
              <IconMenu size={20} />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block opacity-70 group-hover:opacity-100">
            Menu
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-80 p-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-0 overflow-hidden"
        style={{
          borderRadius: `calc(${preferences.buttonRadius} + 8px)`,
          backgroundColor: preferences.background,
          color: preferences.textColor,
        }}
      >
        {/* HEADER DU POPOVER */}
        <div className="p-5 bg-black/2 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 relative overflow-hidden shrink-0 shadow-sm"
              style={{ borderRadius: preferences.buttonRadius }}
            >
              <Image src={shop.logo} alt="logo" fill className="object-cover" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold truncate leading-tight">
                {capitalizeText(shop.name)}
              </h3>
              <p className="text-[10px] opacity-50 uppercase tracking-widest font-bold">
                Boutique Officielle
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <div className="p-2">
          <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">
            <LayoutGrid size={12} /> Navigation
          </div>
          <nav className="space-y-1">
            {LinksData.map((lk: any, idx: number) => (
              <Link
                key={idx}
                href={`/${shop.slug}${lk.value}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-black/5 transition-all group"
              >
                <span className="text-sm font-semibold">{lk.label}</span>
                <ChevronRight
                  size={14}
                  className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                />
              </Link>
            ))}
          </nav>

          {/* AJOUT de boutique */}
          <div className="mt-8 w-full">
            <NBGButton
              preferences={preferences}
              shop={shop}
              className=" font-medium text-sm w-full text-center"
            />
          </div>
        </div>

        {/* USER / AUTH SECTION */}
        <div className="p-4 bg-black/3 border-t border-black/5">
          {user ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm border border-black/5">
              <AvatarUser />
              <div className="overflow-hidden flex-1">
                <p className="font-bold text-xs truncate uppercase tracking-tighter">
                  {user?.name && capitalizeText(user.name)}
                </p>
                <p className="text-[10px] opacity-50 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="scale-90 origin-center">
              <AuthPopup />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShopHeader;
