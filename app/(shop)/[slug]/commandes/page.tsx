import { getUser } from "@/actions/actions";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import ShopCartLogin from "@/components/auth/ShopCartLogin";
import MainOrders from "@/components/shop/orders/MainOrders";
import { prisma } from "@/lib/prisma";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Order, OrderItem, Preferences } from "@prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, ProductShop: true },
  });
  if (!shop) return null;

  return shop;
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  props: Props
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
    title: capitalizeText(shop.name) + " les commandes",
    description: capitalizeText(shop.description),
    openGraph: {
      title: capitalizeText(shop.name),
      description: capitalizeText(shop.description),
      images: [shop.logo],
      type: "website",
    },
    icons: {
      icon: shop.logo,
    },
  };
}

// MY ORDERS
export type ProductInfo = {
  image?: string | null;
  name?: string | null;
  articleId?: string | null;
  productId?: string | null;
};

export type OrderWithProductInfo = Order & {
  productInfo: ProductInfo[];
  orderItems: OrderItem[];
};

const getMyOrders = async (shopId: string, userId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      shopId,
      clientId: userId,
    },
    include: {
      orderItems: true,
    },
    orderBy: {
      createdAt: "desc", // order by date
    },
  });

  const filteredOrders = await Promise.all(
    orders.map(async (order) => {
      const productInfo = await Promise.all(
        order.orderItems.map(async (item) => {
          const article = await prisma.article.findUnique({
            where: { id: item.articleId },
            include: { Product: true },
          });

          return {
            image: article?.Product.image,
            name: article?.Product.name,
            articleId: article?.id,
            productId: article?.Product.id,
          };
        })
      );

      return {
        ...order,
        productInfo,
      };
    })
  );

  return filteredOrders;
};

async function CommandesPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;
  const user = await getUser();

  if (!slug) return redirect("/");

  const shop = await getShopBySlug(slug);

  if (!shop) return <div>Shop not found</div>;

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);

  if (!user) {
    return (
      <div className="w-full min-h-[70dvh] flex items-center justify-center">
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

  const myOrders = (await getMyOrders(
    shop.id,
    user.id
  )) as OrderWithProductInfo[];

  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  return (
    <div>
      <MainOrders
        myOrders={myOrders}
        shopPreferences={preferences}
        shop={shop}
        currency={currency}
        exchange={exchange}
      />
    </div>
  );
}

export default CommandesPage;
