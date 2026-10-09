import { getUser } from "@/actions/actions";
import ShopCartLogin from "@/components/auth/ShopCartLogin";
import { prisma } from "@/lib/prisma";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Preferences, ProductOrigin } from "@/lib/generated/prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import MainOrdersList from "@/components/shop/orders/MainOrdersList";

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      Preferences: true,
      ProductShop: true,
      supplierProductShops: true,
    },
  });
  if (!shop) return null;

  return shop;
};

// PROPS
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// METADATA
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
      robots: { index: false },
    };
  }

  return {
    title: capitalizeText(shop.name) + " les commandes",
    description: capitalizeText(shop.description),
    openGraph: {
      title: capitalizeText(shop.name),
      siteName: capitalizeText(shop.name),
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
      canonical: `https://www.otekis.com/${shop.slug}/commandes`,
    },
  };
}

// GET ORDERS OTEKIS FOR SHOP WITH CLIENT ID
const getOrdersForShop = async (shopId: string, clientId: string) => {
  // 1. GET ORDERS + ITEMS
  const orders = await prisma.order.findMany({
    where: { shopId, clientId },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: true,
    },
  });

  // 2. GET ALL ARTICLE IDS
  const articleIds = [
    ...new Set(
      orders.flatMap((order) => order.orderItems.map((item) => item.articleId)),
    ),
  ];

  // 3. FETCH ALL ARTICLES + PRODUCTS (1 seule requête)
  const articles = await prisma.article.findMany({
    where: {
      id: { in: articleIds },
    },
    include: {
      Product: {
        select: {
          id: true,
          name: true,
          image: true,
          price: true,
          origin: true,
          createdAt: true,
        },
      },
    },
  });

  // 4. CREATE MAP POUR ACCÈS RAPIDE
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  // 5. FORMAT FINAL
  const formattedOrders = orders.map((order) => ({
    ...order,
    orderItems: order.orderItems.map((item) => {
      const article = articleMap.get(item.articleId);

      return {
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        currency: item.currency,
        articleId: item.articleId,

        product: article
          ? {
              id: article.Product.id,
              name: article.Product.name,
              image: article.Product.image,
              price: article.Product.price,
              origin: article.Product.origin,
              createdAt: article.Product.createdAt,
            }
          : null, // sécurité si article supprimé
      };
    }),
  }));

  return formattedOrders;
};

// GET ORDERS OTEKIS FOR SHOP WITH CLIENT ID
const getSupplierOrders = async (shopId: string) => {
  const orders = await prisma.supplierOrder.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        include: {
          Product: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
              origin: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  // format orders
  const formattedOrders = orders.map((order) => ({
    ...order,

    product: {
      id: order.article.Product.id,
      name: order.article.Product.name,
      image: order.article.Product.image,
      price: order.article.Product.price,
      origin: order.article.Product.origin,
      createdAt: order.article.Product.createdAt,
    },

    article: {
      id: order.article.id,
      color: order.article.color,
      size: order.article.size,
      stock: order.article.stock,
    },
  }));

  return formattedOrders;
};

export type UnifiedOrder = {
  id: string;
  createdAt: Date;
  status: string;
  totalAmount: number;
  currency: "USD" | "CDF" | string;
  exchange: number;

  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    origin: ProductOrigin;
    createdAt: Date;
  } | null;

  article: {
    id: string;
    color: string | null;
    size: string | null;
    stock: number;
  } | null;

  quantity: number;
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

  const otekisOrders = await getOrdersForShop(shop.id, user.id);
  const supplierOrders = await getSupplierOrders(shop.id);

  // const allOrders = [...otekisOrders, ...supplierOrders].sort(
  //   (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  // );

  const normalizedOtekis = otekisOrders.map((order) => {
    const firstItem = order.orderItems[0];

    return {
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      exchange: order.exchange,

      product: firstItem?.product ?? null,

      article: firstItem
        ? {
            id: firstItem.articleId,
            color: null,
            size: null,
            stock: 0,
          }
        : null,

      quantity: firstItem?.quantity ?? 0,
    };
  });

  const normalizedSupplier = supplierOrders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    exchange: order.exchange,

    product: order.product,

    article: order.article,

    quantity: order.quantity,
  }));

  const allOrders: UnifiedOrder[] = [
    ...normalizedOtekis,
    ...normalizedSupplier,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const Header = preferences?.Header ?? "0";
  return (
    <div
      className={`p-4 transition-all duration-500 ease-in-out
      ${Number(Header) === 5 ? "pt-24" : "pt-0"}
    `}
    >
      {/* CONTAINER */}
      <MainOrdersList
        shop={shop}
        orders={allOrders}
        preferences={preferences}
      />
    </div>
  );
}

export default CommandesPage;
