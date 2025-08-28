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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { capitalizeText } from "@/utils/shopFunctions";
import { UserAvatar } from "@/components/home/Header";
import { toast } from "sonner";
import { signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Preferences, Shop } from "@prisma/client";
import { Button } from "@/components/ui/button";
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
          <div className="lg:hidden flex items-center">
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

  // SIGN WITH GOOGLE
  const handleSubmitWithGoogle = async () => {
    try {
      await signIn("google", { redirect: false });
    } catch (error) {
      console.log(error);
    }
  };

  // LOG OUT
  const LogUserOut = async () => {
    try {
      await signOut({
        redirect: false,
      });

      toast.success("Vous avez été déconnecté!");
    } catch (error) {
      console.log(error);
      toast.error("Une erreur survenue lors de la déconnexion!");
    }
  };

  return (
    <Sheet>
      <SheetTrigger>
        <IconMenu
          className="min-w-8 flex-shrink-0 lg:hidden"
          style={{
            borderRadius: preferences.buttonRadius,
            borderColor: preferences.textColor,
            color: preferences.textColor,
          }}
        />
      </SheetTrigger>
      <SheetContent
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
          borderColor: preferences.background,
        }}
        side={"left"}
        className="h-dvh overflow-x-hidden overflow-y-auto px-4"
      >
        <SheetHeader>
          <SheetTitle hidden>{capitalizeText(shop.name)}</SheetTitle>
          <SheetDescription hidden>
            {capitalizeText(shop.description)}
          </SheetDescription>
        </SheetHeader>
        {/* contents and links */}
        <div className="grid gap-4 py-4 grid-cols-1">
          {/* links */}
          <div
            className="flex flex-col items-center justify-center 
          gap-4 w-full py-4 border-b"
          >
            {/*LINKS DATA vetements */}
            {LinksData.map((lk, idx) => (
              <SheetClose asChild key={idx}>
                <Link
                  href={`/${shop.slug}${lk.value}`}
                  key={idx}
                  className="w-full hover:opacity-75 hover:underline transition-all duration-500 ease-in-out"
                >
                  <p className="text-[18px] font-bold tracking-wide">
                    {lk.label}
                  </p>
                </Link>
              </SheetClose>
            ))}
          </div>
          {/* btns and user */}
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="flex items-start gap-2 w-full">
              {user && (
                <Link href={"#"}>
                  <UserAvatar />
                </Link>
              )}
              {user && (
                <div>
                  <p className="font-medium line-clamp-1">
                    {user?.name && capitalizeText(user?.name)}
                  </p>
                  <p className="opacity-75 text-xs line-clamp-1">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            <SheetClose asChild className="w-full mt-2">
              {user ? (
                <Button variant={"destructive"} onClick={LogUserOut}>
                  Deconnexion
                </Button>
              ) : (
                <AuthPopup />
              )}
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShopHeader;
