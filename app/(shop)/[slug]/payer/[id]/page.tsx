import React from "react";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Metadata } from "next";
import { SearchX } from "lucide-react";
import ShopCartLogin from "@/components/auth/ShopCartLogin";
import { Preferences } from "@/lib/generated/prisma/client";
import {
  exChangeRate,
  exChangeRateValue,
  getCompanyPreference,
  getCurrencySymbol,
} from "@/actions/companyAction";
import MainComponent from "@/components/shop/buy/MainComponent";

type Props = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      Preferences: true,
      ProductShop: true,
      supplierProductShops: true,
      user: true,
    },
  });
  if (!shop) return null;

  return shop;
};

// GET SUPPLIER PRODUCT
const getSupplierProductById = async (id: string) => {
  const product = await prisma.supplierProduct.findUnique({
    where: { id },
    include: { Article: true, supplierProductShops: true },
  });

  return product;
};

// GET METHOD
export async function generateMetadata(
  props: Props,
): // parent: ResolvingMetadata
Promise<Metadata> {
  const params = await props.params;
  // read route params
  const { slug, id } = params;

  // fetch data
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return {
      title: "Boutique non trouvée",
      description: "La boutique que vous recherchez n'existe pas.",
    };
  }

  const product = await getSupplierProductById(id);

  return {
    title:
      capitalizeText(shop.name) +
      " - " +
      capitalizeText(product?.name ?? "Produit"),
    description: capitalizeText(product?.description ?? ""),
    openGraph: {
      title:
        capitalizeText(shop.name) +
        " - " +
        capitalizeText(product?.name ?? "Produit"),
      description: capitalizeText(product?.description ?? ""),
      images: [product?.image ?? shop.logo],
      type: "website",
    },
    icons: {
      icon: product?.image ?? shop.logo,
    },
  };
}

// PAYMENT METHOD OF PLATFORM
const getDeliveryCompanies = async () => {
  const deliveryCompanies = await prisma.deliveryCompany.findMany({
    where: {
      isAvailable: true,
    },
  });
  return deliveryCompanies;
};

async function page({ params }: Props) {
  const { id: product_id, slug } = await params;

  if (!product_id || !slug) {
    return (
      <div className="px-6 py-10 text-center">
        <h1 className="text-xl font-semibold">Oops! un probleme est survenu</h1>
        <p className="text-muted-foreground">
          La boutique que vous recherchez n'existe pas. Lien invalide
        </p>
      </div>
    );
  }

  const shop = await getShopBySlug(slug);

  if (!shop) {
    return (
      <div className="px-6 py-10 text-center">
        <h1 className="text-xl font-semibold">Boutique non trouvée</h1>
        <p className="text-muted-foreground">
          La boutique que vous recherchez n'existe pas.
        </p>
      </div>
    );
  }

  // HEADER NUM POSITION
  const Header = shop?.Preferences?.Header ?? "0";
  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);

  //   PREFS PLATFORM
  const currency: "USD" | "CDF" =
    (await getCurrencySymbol()) !== "CDF" ? "USD" : "CDF";
  const exchange = await exChangeRate();
  const otekisPrefs = await getCompanyPreference();

  const deliveryService = await getDeliveryCompanies();
  const paymentMethod = otekisPrefs?.paymentMethod || "cash";

  const companyPrefs = {
    currency,
    exchange,
    paymentMethod,
  };

  const product = await getSupplierProductById(product_id);

  if (!product) {
    return (
      <div className="w-full">
        <div
          className="w-full max-w-4xl flex items-center justify-center 
          flex-col min-h-[70dvh] mx-auto
            px-2 box-border gap-4 transition-all duration-500 ease-in-out"
        >
          <h1 className="lg:text-4xl text-3xl font-bold">Rien trouvé</h1>
          <SearchX className="lg:size-20 size-16 opacity-70" />
          <p className="lg:text-2xl text-[18px] font-light opacity-80">
            {"Ce produit n'est disponible pas pour le moment"}
          </p>
        </div>
      </div>
    );
  }

  const supplierProductShops =
    shop && product && product.supplierProductShops
      ? product?.supplierProductShops.find((p) => p.shopId === shop.id)
      : null;

  //   CURRENT USER ? CLIENT
  const user = await getUser();

  if (!user) {
    return (
      <div
        className="w-full min-h-[95dvh] flex flex-col items-center 
      justify-center px-6 text-center space-y-6"
      >
        <h2 className="text-3xl font-extrabold">Vous n’êtes pas connecté</h2>
        <p className="max-w-md text-lg opacity-70">
          Connectez-vous pour ajouter des produits à votre boutique et accéder à
          votre panier.
        </p>
        <ShopCartLogin preferences={preferences} />
      </div>
    );
  }

  const isUserBanned = user?.isBanned;

  const userShop = shop.user;
  const isUserShopBanned = userShop.isBanned;

  if (isUserBanned) {
    return (
      <div className="px-6 py-10 text-center">
        <h1 className="text-xl font-semibold">Accès refusé</h1>
        <p className="text-muted-foreground">
          Votre compte est suspendu. Veuillez contacter le support.
        </p>
      </div>
    );
  }

  if (isUserShopBanned) {
    return (
      <div className="px-6 py-10 text-center">
        <h1 className="text-xl font-semibold">Boutique indisponible</h1>
        <p className="text-muted-foreground">
          Cette boutique est actuellement suspendue.
        </p>
      </div>
    );
  }

  if (!supplierProductShops) {
    return (
      <div className="px-6 py-10 text-center">
        <h1 className="text-xl font-semibold">Oops! un probleme est survenu</h1>
        <p className="text-muted-foreground">
          Ce produit n'est plus disponible dans cette boutique.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 transition-all duration-500 ease-in-out
      ${Number(Header) === 3 ? "pt-24" : "pt-4"}
    `}
    >
      {/* CONTAINER */}
      <MainComponent
        companyPrefs={companyPrefs}
        product={product}
        preferences={preferences}
        shop={shop}
        supplierProductShops={supplierProductShops}
      />
    </div>
  );
}

export default page;
