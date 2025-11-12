"use server";
import MainCartComponent from "@/components/shop/cart/MainCartComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { preferenceDefaults } from "@/utils/preferences";
import { Article, Preferences, Product } from "@prisma/client";
import React from "react";
import ShopCartLogin from "@/components/auth/ShopCartLogin";
import {
  exChangeRate,
  exChangeRateValue,
  getCurrencySymbol,
} from "@/actions/companyAction";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductWthArticle = Product & {
  Article: Article[];
};

const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, ProductShop: true, user: true },
  });
  return shop;
};

const getCartsByUserId = async (userId: string, shopId: string) => {
  const carts = await prisma.cart.findMany({
    where: { userId, productShop: { shopId: shopId } },
    include: { article: true, productShop: true },
    orderBy: { createdAt: "desc" },
  });
  return carts;
};

const getProductsBySlug = async (shopId: string) => {
  const products = await prisma.product.findMany({
    where: {
      ProductShop: {
        some: {
          shopId,
        },
      },
    },
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

const getDeliveryCompanies = async () => {
  const deliveryCompanies = await prisma.deliveryCompany.findMany({
    where: {
      isAvailable: true,
    },
  });
  return deliveryCompanies;
};

const CartShopPage = async (props: Props) => {
  const params = await props.params;
  const user = await getUser();

  const { slug } = params;

  const shop = await getShopBySlug(slug);

  if (!shop) {
    return <div>pas de boutique trouvée.</div>;
  }

  const products = await getProductsBySlug(shop.id);
  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const productsShop = shop.ProductShop;

  if (!user) {
    return (
      <div className="w-full min-h-[95dvh] flex flex-col items-center justify-center px-6 text-center space-y-6">
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

  const carts = await getCartsByUserId(user.id, shop.id);
  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();
  const exchangeValue = await exChangeRateValue();

  const deliveryService = await getDeliveryCompanies();

  // console.table(deliveryService);

  return (
    <div>
      <MainCartComponent
        shop={shop}
        products={products as unknown as ProductWthArticle[]}
        shopPreferences={preferences}
        productsShop={productsShop}
        carts={carts}
        isUserShopBanned={isUserShopBanned}
        isUserBanned={isUserBanned}
        currency={currency}
        exchange={exchange}
        exchangeValue={exchangeValue}
        deliveryService={deliveryService}
      />
    </div>
  );
};

export default CartShopPage;
