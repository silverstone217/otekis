import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { preferenceDefaults } from "@/utils/preferences";
import { Preferences } from "@/lib/generated/prisma/client";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import ShopCartLogin from "@/components/auth/ShopCartLogin";
import RandoPaymentForm from "@/components/shop/keys/RandoPaymentForm";
import GameKeysList from "@/components/shop/keys/gamekeyslist";
import {
  RANDO_ALLOWED_SHOP_SLUG,
  RANDO_GAME_NAME,
  RANDO_GAME_PRICE_USD,
  normalizeHwid,
} from "@/utils/randonarando";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hwid?: string | string[] }>;
};

// GET SHOP
const getShopBySlug = async (slug: string) => {
  return prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true },
  });
};

// GET ALL KEYS FROM USER (les plus récentes d'abord)
const getUserKeys = async (userId: string) => {
  const keys = await prisma.gameAcccesKey.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, key: true, createdAt: true },
  });

  return keys.map((k) => ({ ...k, createdAt: k.createdAt.toISOString() }));
};

async function AccesskeyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { hwid: hwidParam } = await searchParams;

  // Jeu disponible dans une seule boutique (à renseigner dans utils/randoNaRando.ts)
  // Rediriger si la boutique n'est pas autorisée
  if (RANDO_ALLOWED_SHOP_SLUG && slug !== RANDO_ALLOWED_SHOP_SLUG) {
    redirect(`/${slug}`);
  }

  const shop = await getShopBySlug(slug);
  if (!shop) return notFound();

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const Header = Number(preferences.Header) || 0;

  const user = await getUser();

  // PRIX : dollars -> devise de la plateforme
  const currency: "USD" | "CDF" =
    (await getCurrencySymbol()) !== "CDF" ? "USD" : "CDF";
  const exchange = await exChangeRate(); // USD = 1, CDF = taux de change
  const gamePrice = RANDO_GAME_PRICE_USD * exchange;

  // HWID reçu par l'URL (?hwid=...) : nettoyé, il reste modifiable par le client
  const rawHwid = Array.isArray(hwidParam) ? hwidParam[0] : hwidParam;
  const initialHwid = rawHwid ? normalizeHwid(rawHwid).slice(0, 64) : "";

  const keys = user && !user.isBanned ? await getUserKeys(user.id) : [];

  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-10 md:px-6"
      style={{
        backgroundColor: preferences.background,
        color: preferences.textColor,
        fontFamily: preferences.fontFamily,
      }}
    >
      <div className={Header === 5 ? "pt-30" : "pt-24"} />

      <header className="mx-auto mb-8 max-w-2xl space-y-2 text-center">
        <h1 className="text-3xl font-semibold">{RANDO_GAME_NAME}</h1>
        <p className="opacity-70">
          Activez le jeu sur votre ordinateur : renseignez votre HWID, payez,
          puis recopiez la clé reçue dans le jeu.
        </p>
      </header>

      {!user ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-10 text-center">
          <h2 className="text-2xl font-bold">Vous n'êtes pas connecté</h2>
          <p className="opacity-70">
            Connectez-vous pour acheter votre clé d'activation et retrouver vos
            clés précédentes.
          </p>
          <ShopCartLogin preferences={preferences} />
        </div>
      ) : user.isBanned ? (
        <div className="px-6 py-10 text-center">
          <h2 className="text-xl font-semibold">Accès refusé</h2>
          <p className="opacity-70">
            Votre compte est suspendu. Veuillez contacter le support.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <RandoPaymentForm
            preferences={preferences}
            shopSlug={slug}
            initialHwid={initialHwid}
            price={gamePrice}
            currency={currency}
          />
          <GameKeysList keys={keys} preferences={preferences} />
        </div>
      )}
    </div>
  );
}

export default AccesskeyPage;
