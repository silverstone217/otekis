"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
import Image from "next/image";
import {
  shopAccDataLinks,
  ShopAllDataLinks,
  shopCosmeticDataLinks,
  shopDataLinks,
} from "@/utils/shopData";
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
import { Preferences, Shop } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ShopHeaderType } from "../first/ShopHeader";

const ShopHeader = ({
  shop,
  // getMyFont,
  preferences: preference,
}: ShopHeaderType) => {
  // const [isOpen, setIsOpen] = useState(false);
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

  // const IconMenu = useMemo(
  //   () => MenuIcons[preference.menuIcon ? parseInt(preference.menuIcon) : 0],
  //   [preference.menuIcon]
  // );

  const LinksData =
    ShopAllDataLinks[
      shop.category as "cosmetiques" | "vetements" | "accessoires"
    ] ?? ShopAllDataLinks["cosmetiques"];

  //   MenuIcons

  if (!isClient) return null;

  return (
    <header
      style={{ backgroundColor: preference.background }}
      className="w-full h-14 flex items-center px-4 fixed top-0 left-0 
      backdrop-blur z-40 shadow-md"
    >
      <div className="w-full flex item-center justify-between gap-6 h-full ">
        {/* title link */}
        <div
          className="flex item-center justify-center gap-4 h-full 
        place-items-center"
        >
          <div className="lg:hidden flex items-center justify-center">
            <SmallDevicesLinksPart shop={shop} preferences={preference} />
          </div>

          <Link
            href={`/${shop.slug}`}
            className="flex item-center justify-center gap-2 h-full 
            place-items-center"
          >
            {preference.logo === "name" ? (
              <h1
                style={{ color: preference?.textColor ?? textColorData.light }}
                className="text-[18px] font-black tracking-wide capitalize"
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

        {/* links and cart*/}
        <div className="h-full lg:flex hidden flex-1 items-center justify-between">
          {/* links */}
          <div className="flex items-center justify-end gap-4">
            {/* LINKS vetements */}

            {/* cosmetiques */}
            {LinksData.map((lk, idx) => (
              <LinkShop
                key={idx}
                link={lk.value}
                label={lk.label}
                slug={shop.slug}
              />
            ))}
          </div>
          {/* btns, profile and cart */}
          <div className="flex gap-4 item-center justify-start">
            {/* profile */}
            {user && (
              <Link href={"#"}>
                <UserAvatar />
              </Link>
            )}

            <Link
              href={`/${shop.slug}/panier`}
              className="flex items-center justify-center "
            >
              <IconCart className="w-8 flex-shrink-0  opacity-75" />
            </Link>
          </div>
        </div>
        {/* cart */}
        <div className="flex gap-4 item-center lg:hidden">
          <Link
            href={`/${shop.slug}/panier`}
            className="flex items-center justify-center "
          >
            <IconCart className="w-8 flex-shrink-0  opacity-75" />
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
}: {
  slug: string;
  link: string;
  label: string;
}) => {
  return (
    <Link
      href={`/${slug}${link}`}
      className={cn(
        "font-medium",
        "transition-all ease-in-out duration-500 hover:underline hover:opacity-75"
      )}
    >
      {label}
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
      toast.success("Vous avez été déconnecté!");
    } catch (error) {
      console.log(error);
      toast.error("Une erreur est survenue lors de la déconnexion!");
    }
  };

  return (
    <Sheet>
      {/* Trigger bouton menu */}
      <SheetTrigger>
        <IconMenu
          className="lg:hidden cursor-pointer 
          transition-transform hover:scale-110"
          style={{
            borderRadius: preferences.buttonRadius,
            color: preferences.textColor,
          }}
        />
      </SheetTrigger>

      {/* Drawer content */}
      <SheetContent
        side="left"
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
        }}
        className="h-dvh overflow-y-auto px-6 py-6 flex flex-col gap-8"
      >
        <SheetTitle hidden />

        {/* HEADER : Logo + Shop name */}
        <div className="flex items-center gap-3 border-b pb-4">
          <Image
            src={shop.logo}
            alt={shop.name}
            width={56}
            height={56}
            className="object-cover rounded-full shadow-sm size-12 shrink-0"
            // style={{ borderRadius: preferences.buttonRadius }}
          />
          <div>
            <h2 className="text-lg font-bold capitalize leading-tight">
              {capitalizeText(shop.name)}
            </h2>
            <p className="text-xs opacity-70 line-clamp-1">
              {capitalizeText(shop.description)}
            </p>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="flex flex-col gap-3">
          {LinksData.map((lk, idx) => (
            <SheetClose asChild key={idx}>
              <Link
                href={`/${shop.slug}${lk.value}`}
                className="px-3 py-2 rounded-lg font-medium tracking-wide transition-all
                hover:bg-black/10 hover:opacity-80"
                style={{
                  borderRadius: preferences.buttonRadius,
                }}
              >
                {lk.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        {/* USER SECTION */}
        <div className="mt-auto flex flex-col gap-4 pt-6 border-t">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <UserAvatar />
                <div className="min-w-0">
                  <p className="font-semibold line-clamp-1">
                    {user?.name && capitalizeText(user?.name)}
                  </p>
                  <p className="text-xs opacity-70 line-clamp-1">
                    {user?.email}
                  </p>
                </div>
              </div>

              <SheetClose asChild>
                <Button
                  variant="destructive"
                  onClick={LogUserOut}
                  className="w-full"
                >
                  Déconnexion
                </Button>
              </SheetClose>
            </>
          ) : (
            <AuthPopup />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShopHeader;
