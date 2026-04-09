"use client";
import { cn } from "@/lib/utils";
import {
  shopAccDataLinks,
  shopCosmeticDataLinks,
  shopDataLinks,
} from "@/utils/shopData";
import { capitalizeText } from "@/utils/shopFunctions";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
// import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { UserAvatar } from "../home/Header";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartIcons, MenuIcons, textColorData } from "@/utils/preferences";
import Image from "next/image";
import { Button } from "../ui/button";
import googleIcon from "@/public/icons/googleIcon.svg";
import { toast } from "sonner";

type Props = {
  shop: Shop;
  preference: Preferences;
};

const ShopHeader = ({ shop, preference }: Props) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // update logo
  useEffect(() => {
    const updateFavicon = (iconURL: string): void => {
      let favicon = document.querySelector(
        'link[rel="icon"]',
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
    [preference.cartIcon],
  );

  if (!isClient) return null;

  return (
    <header
      style={{ backgroundColor: preference.background }}
      className="w-full h-14 flex items-center px-4 fixed top-0 left-0 backdrop-blur z-40 shadow-md"
    >
      <div className="w-full flex item-center justify-between gap-6 h-full ">
        {/* title link */}
        <div className="flex item-center justify-center gap-4 h-full place-items-center">
          <div className="lg:hidden flex items-center">
            <SmallDevicesLinksPart shop={shop} preferences={preference} />
          </div>

          <Link
            href={`/${shop.slug}`}
            className="flex item-center justify-center gap-2 h-full place-items-center"
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
            {/* vetements */}
            {shop.category === "vetements" &&
              shopDataLinks.map((lk, idx) => (
                <LinkShop
                  key={idx}
                  link={lk.value}
                  label={lk.label}
                  slug={shop.slug}
                />
              ))}

            {/* accessoires */}
            {shop.category === "accessoires" &&
              shopAccDataLinks.map((lk, idx) => (
                <LinkShop
                  key={idx}
                  link={lk.value}
                  label={lk.label}
                  slug={shop.slug}
                />
              ))}

            {/* cosmetiques */}
            {shop.category === "cosmetiques" &&
              shopCosmeticDataLinks.map((lk, idx) => (
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

export default ShopHeader;

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
        "transition-all ease-in-out duration-500 hover:underline hover:opacity-75",
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
  const { data: session } = useSession();
  const user = session?.user;
  const IconMenu = useMemo(
    () => MenuIcons[parseInt(preferences.menuIcon)],
    [preferences.menuIcon],
  );

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
        <IconMenu className="w-8 flex-shrink-0 lg:hidden" />
      </SheetTrigger>
      <SheetContent
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
          borderColor: preferences.background,
        }}
        side={"left"}
      >
        <SheetHeader>
          <SheetTitle hidden>{capitalizeText(shop.name)}</SheetTitle>
          <SheetDescription hidden>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        {/* contents and links */}
        <div className="grid gap-4 py-4 grid-cols-1">
          {/* links */}
          <div className="flex flex-col items-center justify-center gap-4 w-full py-4 border-b">
            {/* vetements */}
            {shop.category === "vetements" &&
              shopDataLinks.map((lk, idx) => (
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

            {/* accessoires */}
            {shop.category === "accessoires" &&
              shopAccDataLinks.map((lk, idx) => (
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

            {/* cosmetiques */}
            {shop.category === "cosmetiques" &&
              shopCosmeticDataLinks.map((lk, idx) => (
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
                  <p className="font-medium">
                    {user?.name && capitalizeText(user?.name)}
                  </p>
                  <p className="opacity-75 text-xs">{user?.email}</p>
                </div>
              )}
            </div>

            <SheetClose asChild className="w-full mt-2">
              {user ? (
                <Button variant={"destructive"} onClick={LogUserOut}>
                  Deconnexion
                </Button>
              ) : (
                <button
                  type="button"
                  className=" w-full justify-center flex gap-2 items-center py-3 text-sm
          hover:scale-110 hover:shadow-2xl transition-all duration-500 ease-in-out"
                  onClick={handleSubmitWithGoogle}
                  style={{
                    backgroundColor: preferences.buttonColor,
                    color: preferences.buttonTextColor,
                    borderRadius: preferences.buttonRadius,
                  }}
                >
                  <Image
                    src={googleIcon}
                    alt="google Icon"
                    width={500}
                    height={500}
                    priority
                    className="size-6 object-cover"
                  />
                  <span>Continuer avec Google</span>
                </button>
              )}
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
