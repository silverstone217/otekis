import { getUser } from "@/actions/actions";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import {
  getFactureDeliveryOrderById,
  getFactureOrderById,
} from "@/actions/factureActions";
import {
  getDeliveryOrderWithClientOrder,
  getMyOrderById,
} from "@/actions/myOrderAction";
import ShopCartLogin from "@/components/auth/ShopCartLogin";
import MainMyOrder from "@/components/shop/orders/MainMyOrder";
import { prisma } from "@/lib/prisma";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Preferences } from "@/lib/generated/prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import { getOtekisOrder } from "@/actions/admins/orders/adminsOrders";

export type DeliveryInfoOrderType =
  | ({
      deliveryCompany: {
        id: string;
        name: string;
        phone: string;
      } | null;
    } & {
      id: string;
      description: string | null;
      percentage: string;

      createdAt: Date;
      updatedAt: Date;

      clientId: string;

      status: string;
      currency: string;
      exchange: number;

      receiverTel: string;
      receiverName: string;

      deliveryPrice: number;

      orderId: string;

      deliveryId: string | null;
      deliveryCompanyId: string | null;

      deliveryDate: Date | null;

      deliveryAddress: string;
    })
  | null;

// Get shop by slug and preferences
const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, ProductShop: true },
  });
  if (!shop) return null;

  return shop;
};

const otekisPrefs = async () => {
  const otekisPref = await prisma.otekisPreferences.findFirst();
  return otekisPref;
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

async function MyOrderPage(props: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const params = await props.params;
  const { slug, id } = params;
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

  if (!id) {
    return redirect(`/${shop.slug}/commandes`);
  }

  const myOrder = await getMyOrderById(id, shop.category);

  if (!myOrder) {
    return redirect(`/${shop.slug}/commandes`);
  }

  if (user.id !== myOrder.clientId) {
    return (
      <div className="w-full min-h-[70dvh] flex items-center justify-center">
        <div className="flex flex-col gap-1 px-4">
          <h2 className="text-2xl font-bold ">{`Vous n'etes pas authorisé a voire ce contenu.`}</h2>
          <p className="text-xm opacity-75 text-center">
            {`Si un probleme est survenu contacter notre service client.`}
          </p>
          {/* login */}
        </div>
      </div>
    );
  }
  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  // DELIVERY INFO
  const deliveryInfo = await getDeliveryOrderWithClientOrder(myOrder.id);

  // FACTURE ORDER
  const factureOrder = await getFactureOrderById(myOrder.id);

  // FACTURE DELIVERY
  const factureDelivery = await getFactureDeliveryOrderById(myOrder.id);

  const order = await getOtekisOrder(id);
  if (!order) {
    return <div>Order not found</div>;
  }

  const products = order.products;

  const deliveryInfoOrder = order.deliveryOrder;
  const deliveryCompany = deliveryInfoOrder?.deliveryCompany as {
    id: string;
    name: string;
    phone: string;
  } | null;

  return (
    <div>
      <MainMyOrder
        shop={shop}
        myOrder={myOrder}
        shopPreferences={preferences}
        currency={currency}
        exchange={exchange}
        deliveryInfo={deliveryInfo}
        otekisPrefs={await otekisPrefs()}
        factureOrder={factureOrder}
        factureDelivery={factureDelivery}
        deliveryCompany={deliveryCompany}
        products={products}
        deliveryInfoOrder={deliveryInfoOrder}
      />
    </div>
  );
}

export default MyOrderPage;
