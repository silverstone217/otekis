import ShopFooter from "@/components/shop/ShopFooter";
import { prisma } from "@/lib/prisma";
import {
  backgroundColors,
  preferenceDefaults,
  textColorData,
} from "@/utils/preferences";
import { Preferences } from "@/lib/generated/prisma/client";
import { redirect } from "next/navigation";
import React, { ReactNode, Suspense } from "react";
import { cn } from "@/lib/utils";
import { capitalizeText } from "@/utils/shopFunctions";
import { Metadata } from "next";
import { FontsList } from "@/utils/fontsData";

// HEADERS
import ShopHeaderThird from "@/components/new-shop/templates/third/ShopHeader";
import ShopHeaderSecond from "@/components/new-shop/templates/second/ShopHeader";
import ShopHeaderOne from "@/components/new-shop/templates/first/ShopHeader";
import ShopHeaderFourth from "@/components/new-shop/templates/fourth/ShopHeader";
import ShopHeaderFifth from "@/components/new-shop/templates/fifth/ShopHeader";

// HEROS
import ShopHeroOne from "@/components/new-shop/templates/first/ShopHero";
import ShopHeroSecond from "@/components/new-shop/templates/second/ShopHero";
import ShopHeroThird from "@/components/new-shop/templates/third/ShopHero";
import ShopHeroFourth from "@/components/new-shop/templates/fourth/ShopHero";
import NotShopStatusFind, {
  IsShopBanOrNotPublished,
} from "@/components/shop/NotPublishedComponent";

// HEADERS DATA
const HEADERS_DATA = [
  ShopHeaderOne,
  ShopHeaderSecond,
  ShopHeaderThird,
  ShopHeaderFourth,
  ShopHeaderFifth,
];

// HEADERS DATA
const HEROS_DATA = [ShopHeroOne, ShopHeroSecond, ShopHeroThird, ShopHeroFourth];

type Props = {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

// Ready shop category
const ReadyShopCategory = ["cosmetiques", "vetements", "accessoires"];

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, Contact: true },
  });
  if (!shop) return null;

  return shop;
};

const MyShopLayout = async (props: Props) => {
  const params = await props.params;

  const { children } = props;

  const { slug } = params;

  if (!slug) return redirect("/");

  const shop = await getShopBySlug(slug);
  // if no shop find!
  if (!shop) return <NotShopStatusFind />;

  const isShopBanOrNotPublished =
    shop.isBanned || !shop.isPublished ? true : false;

  if (isShopBanOrNotPublished) {
    return <IsShopBanOrNotPublished />;
  }

  // Définir les métadonnées
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const metadata: Metadata = {
    title: `${capitalizeText(shop.name)} – Boutique en ligne`,

    description: capitalizeText(shop.description),
    openGraph: {
      title: `${capitalizeText(shop.name)} – Boutique`,
      siteName: "Otekis",
      description: capitalizeText(shop.description),
      images: [
        {
          url: shop.logo, // Assure-toi que c'est une URL absolue
          width: 800,
          height: 600,
        },
      ],
      type: "website",
      url: "https://www.otekis.com/" + shop.slug,
    },
    icons: {
      icon: shop.logo,
    },
    alternates: {
      canonical: `https://www.otekis.com/${shop.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const contacts = shop.Contact;
  const myFont = preferences.fontFamily;

  const getMyFont = FontsList.find((font) => font.name === myFont)?.component;

  const category = shop.category;

  if (!ReadyShopCategory.includes(category)) {
    return (
      <div
        style={{
          backgroundColor: preferences?.background ?? backgroundColors.white,
          color: preferences?.textColor ?? textColorData.light,
        }}
        className={cn("pt-14 overflow-x-hidden ", getMyFont?.className)}
        key={shop.id}
      >
        <div className="min-h-[70dvh] w-full flex items-center justify-center flex-col px-4 text-pretty">
          <h1 className="lg:text-5xl text-4xl font-bold mb-4">
            Page en construction...
          </h1>
          <p className=":lg:text-lg text-md mb-2">
            {`Nous travaillons actuellement sur cette fonctionnalité.`}
          </p>
          <p className="text-sm mb-6">
            {`Veuillez nous excusez pour la gêne occasionnelle.`}
          </p>
          <a
            href={`/`}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
          >
            {`Retourner à l'accueil`}
          </a>
        </div>
      </div>
    );
  }
  // HEADER
  const Header = preferences.Header;
  const CurrentHeader = HEADERS_DATA[Number(Header)] ?? HEADERS_DATA[0];

  return (
    <>
      {/* Utiliser les métadonnées */}
      {/* <MyMetadata /> */}

      <div
        style={{
          backgroundColor: preferences?.background ?? backgroundColors.white,
          color: preferences?.textColor ?? textColorData.light,
        }}
        className={cn(
          "overflow-x-hidden ",
          getMyFont?.className,
          Number(Header) === 3 || Number(Header) === 4 ? "pt-0" : "pt-14"
        )}
        key={shop.id}
      >
        {}
        <CurrentHeader
          preferences={preferences as Preferences}
          shop={shop}
          getMyFont={getMyFont!}
        />
        <main className="min-h-[70dvh]">{children}</main>
        {/* separator */}
        <div className="py-10" />
        <Suspense>
          <ShopFooter
            preference={preferences}
            shop={shop}
            contacts={contacts}
          />
        </Suspense>
      </div>
    </>
  );
};

export default MyShopLayout;
