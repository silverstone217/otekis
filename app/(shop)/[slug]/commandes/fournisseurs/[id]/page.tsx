import React from "react";
import { prisma } from "@/lib/prisma";
import { capitalizeText } from "@/utils/shopFunctions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/actions/actions";
import ShopCartLogin from "@/components/auth/ShopCartLogin";
import { Preferences } from "@/lib/generated/prisma/client";
import { preferenceDefaults } from "@/utils/preferences";
import MainSupplierOrderView from "@/components/shop/orders/MainSupplierOrderView";

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, ProductShop: true },
  });
  if (!shop) return null;

  return shop;
};

export async function generateMetadata(
  props: Props,
): // parent: ResolvingMetadata
Promise<Metadata> {
  const params = await props.params;
  // read route params
  const { slug } = params;

  // fetch data
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return {
      title: "Boutique non trouvée",
      description: "La boutique que vous recherchez n'existe pas.",
    };
  }

  return {
    title: capitalizeText(shop.name) + " - ma commande",
    description: capitalizeText(shop.description),
    openGraph: {
      title: capitalizeText(shop.name),
      description: capitalizeText(shop.description),
      images: [shop.logo],
      type: "website",
      url: "https://www.otekis.com/" + shop.slug,
    },
    icons: {
      icon: shop.logo,
    },
    alternates: {
      canonical: `https://www.otekis.com/${shop.slug}`,
    },
  };
}

type Props = {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.supplierOrder.findUnique({
    where: { id: orderId, clientId: userId },
    include: {
      article: {
        include: {
          Product: true,
        },
      },
      deliveryCompany: true,
    },
  });
  return order;
};

async function FournissuerProductOrderId(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const params = await props.params;
  const { slug, id } = params;
  const user = await getUser();

  if (!slug) return redirect("/");

  const shop = await getShopBySlug(slug);

  if (!shop) return <div>Shop not found</div>;

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const HEADER_NUMBER = preferences?.Header || 0;

  if (!user) {
    return (
      <div className="w-full min-h-[95dvh] flex items-center justify-center">
        <div className="flex flex-col gap-1 px-4">
          <h2 className="text-2xl font-bold ">{`Vous n'etes pas connecté a votre compte.`}</h2>
          <p className="text-xm opacity-75">
            {`Connectez-vous afin d'acceder cette page.`}
          </p>
          {/* login */}
          <ShopCartLogin preferences={preferences} />
        </div>
      </div>
    );
  }

  const order = await getOrderById(id, user.id);

  if (!order) {
    return <div>Order not found</div>;
  }

  const { article, deliveryCompany } = order;
  const product = article.Product;
  const isDigitalProduct = product.category === "digital";

  return (
    <div className={`${HEADER_NUMBER === "5" ? "pt-20" : "pt-0"}`}>
      <MainSupplierOrderView
        order={order}
        product={product}
        article={article}
        shop={shop}
        preferences={preferences}
        deliveryCompany={deliveryCompany}
        isDigitalProduct={isDigitalProduct}
      />
    </div>
  );
}

export default FournissuerProductOrderId;
