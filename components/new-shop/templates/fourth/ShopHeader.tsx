"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
import Image from "next/image";
import { ShopAllDataLinks } from "@/utils/shopData";
import { X, ShoppingBag, User, Home, ArrowRight } from "lucide-react";
import { useCurrentUser } from "@/hooks/UserAuth";
import { AuthPopup } from "@/components/SignUserInPopUp";
import AvatarUser from "@/components/AvatarUser";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
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
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useCurrentUser();

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        "fixed top-0 left-0 right-0 z-100 transition-all duration-500 h-24 flex items-center justify-center pointer-events-none",
        getMyFont?.className,
      )}
    >
      {/* Barre flottante (Floating Pill) */}
      <div
        className={cn(
          "flex items-center justify-between w-[92%] max-w-lg h-14 px-5 transition-all duration-500 border pointer-events-auto",
          scrolled ? "-translate-y-2.5 scale-95 shadow-2xl" : "shadow-xl",
        )}
        style={{
          borderRadius: preference.buttonRadius,
          backgroundColor: `${preference?.background}F2` || "#ffffffF2", // Opacité 95%
          color: preference?.textColor || textColorData.light,
          borderColor: `${preference?.textColor}15`,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo / Nom */}
        <Link
          href={`/${shop.slug}`}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          {preference.logo === "name" ? (
            <span
              className="font-black text-sm tracking-tighter uppercase 
            italic truncate max-w-[120px] line-clamp-1"
            >
              {shop.name}
            </span>
          ) : (
            <div
              className="relative w-8 h-8 overflow-hidden"
              style={{ borderRadius: "50%" }}
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

        {/* Actions centrales/droite */}
        <div className="flex items-center gap-1">
          <Link
            href={`/${shop.slug}/panier`}
            className="p-2.5 relative hover:bg-black/5 transition-all active:scale-90"
            style={{ borderRadius: "50%" }}
          >
            <IconCart className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </Link>

          <Separator orientation="vertical" className="h-6 mx-1 opacity-20" />

          <SheetMenuNav
            IconMenu={IconMenu}
            preferences={preference}
            shop={shop}
            user={user}
          />
        </div>
      </div>
    </header>
  );
};

/* --- COMPOSANT SHEET AMELIORÉ --- */
const SheetMenuNav = ({
  shop,
  preferences,
  IconMenu,
  user,
}: {
  shop: Shop;
  preferences: Preferences;
  IconMenu: IconLikeComponent;
  user: any;
}) => {
  const [open, setOpen] = useState(false);
  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="p-2.5 hover:bg-black/5 transition-all active:scale-90"
          style={{ borderRadius: "50%" }}
        >
          <IconMenu className="w-fit h-fit" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-[2.5rem] border-t-0 p-0 overflow-hidden flex flex-col"
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
          zIndex: 999,
        }}
      >
        {/* Barre de drag avec bouton fermer intégré */}
        <div className="w-full flex flex-col items-center py-4 shrink-0">
          <div className="w-12 h-1.5 bg-current opacity-10 rounded-full mb-2" />
          <button
            onClick={() => setOpen(false)}
            className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            Fermer
          </button>
        </div>

        {/* Contenu principal du menu */}
        <div className="p-8 flex-1 overflow-y-auto">
          <SheetHeader className="text-left mb-8">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 relative shrink-0"
                style={{ borderRadius: preferences.buttonRadius }}
              >
                <Image
                  src={shop.logo}
                  alt="logo"
                  fill
                  className="object-cover rounded-[inherit]"
                />
              </div>
              <div>
                <SheetTitle
                  className="text-2xl font-bold italic "
                  style={{
                    color: preferences.textColor,
                  }}
                >
                  {capitalizeText(shop.name)}
                </SheetTitle>
                <SheetDescription
                  className="line-clamp-1 opacity-40"
                  style={{ color: preferences.textColor }}
                >
                  {shop.description || "Bienvenue dans notre boutique"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-8">
            {/* Liens de Navigation */}
            <div className="grid grid-cols-1 gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2 ml-1 text-current">
                Navigation
              </p>
              {LinksData.map((lk, idx) => (
                <Link
                  href={`/${shop.slug}${lk.value}`}
                  key={idx}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-current/3 hover:bg-current/[0.07] transition-all group"
                >
                  <span className="font-semibold text-lg">{lk.label}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}

              {/* AJOUT de boutique */}
              <div className="mt-8 w-full">
                <NBGButton
                  preferences={preferences}
                  shop={shop}
                  className=" font-medium text-sm w-full text-center"
                />
              </div>
            </div>

            {/* Section Utilisateur */}
            <div className="pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-4 ml-1 text-current">
                Compte
              </p>
              {user ? (
                <div className="flex items-center gap-4 p-4 rounded-3xl border border-current/10">
                  <AvatarUser />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold truncate">{user.name}</p>
                    <p className="text-xs opacity-50 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full py-2">
                  <AuthPopup />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer du menu */}
        <div className="p-8 bg-current/3 mt-auto">
          <p className="text-center text-[10px] opacity-40 uppercase tracking-widest font-bold">
            Expédition disponible partout • {shop.name}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShopHeader;
