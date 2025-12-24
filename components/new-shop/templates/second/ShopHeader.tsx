"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
import Image from "next/image";
import { ShopAllDataLinks } from "@/utils/shopData";
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { capitalizeText } from "@/utils/shopFunctions";
import { UserAvatar } from "@/components/home/Header";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ShopHeaderType } from "../first/ShopHeader";
import { LogOut, User } from "lucide-react";

const ShopHeader = ({ shop, preferences: preference }: ShopHeaderType) => {
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useCurrentUser();

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    () => CartIcons[preference.cartIcon ? parseInt(preference.cartIcon) : 0],
    [preference.cartIcon]
  );

  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  if (!isClient) return null;

  return (
    <header
      style={{
        backgroundColor: preference.background,
        color: preference.textColor,
      }}
      className={cn(
        "w-full h-16 fixed top-0 left-0 z-50 transition-all duration-300 px-4 md:px-8 flex items-center justify-between",
        scrolled
          ? "shadow-lg h-14 backdrop-blur-md bg-opacity-90"
          : "shadow-none"
      )}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-full gap-4">
        {/* PARTIE GAUCHE : Menu Mobile + Logo */}
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="lg:hidden">
            <SmallDevicesLinksPart shop={shop} preferences={preference} />
          </div>

          <Link
            href={`/${shop.slug}`}
            className="flex items-center gap-3 group"
          >
            {preference.logo === "name" ? (
              <h1 className="text-xl font-black tracking-tight uppercase">
                {shop.name}
              </h1>
            ) : (
              <div
                className="relative h-9 w-9 overflow-hidden transition-transform group-hover:scale-105"
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

          {/* Navigation Desktop intégrée à gauche après le logo */}
          <nav className="hidden lg:flex items-center gap-6 ml-4">
            {LinksData.map((lk, idx) => (
              <LinkShop
                key={idx}
                link={lk.value}
                label={lk.label}
                slug={shop.slug}
                textColor={preference.textColor}
              />
            ))}
          </nav>
        </div>

        {/* PARTIE DROITE : Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* User Profile Desktop */}
          <div className="hidden md:flex items-center">
            {user ? (
              <Link
                href={`/${shop.slug}/profil`}
                className="hover:opacity-80 transition-opacity"
              >
                <UserAvatar />
              </Link>
            ) : (
              <AuthPopup />
            )}
          </div>

          <div className="h-6 w-px bg-gray-300/30 hidden md:block mx-1" />

          {/* Panier avec animation badge */}
          <Link
            href={`/${shop.slug}/panier`}
            className="p-2 relative hover:bg-black/5 transition-colors duration-200"
            style={{ borderRadius: preference.buttonRadius }}
          >
            <IconCart className="w-6 h-6 opacity-90" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

const LinkShop = ({
  slug,
  link,
  label,
  textColor,
}: {
  slug: string;
  link: string;
  label: string;
  textColor: string;
}) => {
  return (
    <Link
      href={`/${slug}${link}`}
      className="text-sm font-semibold uppercase tracking-wider opacity-70 hover:opacity-100 transition-all relative group"
    >
      {label}
      <span
        className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
        style={{ backgroundColor: textColor }}
      />
    </Link>
  );
};

type SmallDevicesLinksPartial = {
  shop: Shop;
  preferences: Preferences;
};

const SmallDevicesLinksPart = ({
  shop,
  preferences,
}: SmallDevicesLinksPartial) => {
  const user = useCurrentUser();
  const IconMenu = useMemo(
    () => MenuIcons[parseInt(preferences.menuIcon)],
    [preferences.menuIcon]
  );

  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  const LogUserOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Déconnecté");
    } catch (error) {
      toast.error("Erreur");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 -ml-2">
          <IconMenu className="w-6 h-6" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
        }}
        className="w-[300px] sm:w-[350px] border-r-0 p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>

        {/* Header Drawer */}
        <div className="p-6 flex items-center gap-4 border-b border-black/5">
          <div className="size-12 rounded-full bg-black/5 p-1">
            <Image
              src={shop.logo}
              alt="logo"
              width={48}
              height={48}
              className="rounded-full object-cover h-full w-full"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">{shop.name}</h2>
            <p className="text-xs opacity-50 mt-1 uppercase tracking-tighter">
              Boutique en ligne
            </p>
          </div>
        </div>

        {/* Links Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {LinksData.map((lk, idx) => (
            <SheetClose asChild key={idx}>
              <Link
                href={`/${shop.slug}${lk.value}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-black/5 transition-colors font-medium"
              >
                {lk.label}
              </Link>
            </SheetClose>
          ))}
        </div>

        {/* User Footer Drawer */}
        <div className="p-6 mt-auto border-t border-black/5 bg-black/2">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserAvatar />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm">{user.name}</p>
                  <p className="text-xs opacity-50 truncate">{user.email}</p>
                </div>
              </div>
              <button
                className="w-full justify-start gap-2 h-11
                px-4 rounded-xl bg-red-500/10 text-red-600 font-medium 
                hover:bg-red-500/20 transition-colors flex items-center
                "
                onClick={LogUserOut}
              >
                <LogOut className="size-4" /> Déconnexion
              </button>
            </div>
          ) : (
            <div className="w-full">
              <AuthPopup />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShopHeader;
