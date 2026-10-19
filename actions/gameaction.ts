"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";
import { exChangeRate, getCurrencySymbol } from "./companyAction";
import {
  FLEXPAIE_MERCHANT_CODE,
  FLEXPAIE_TOKEN,
  FLEXPAIE_URL_API,
} from "@/utils/envVariables";
import { v4 } from "uuid";
import { checkFlexpaiePaymentAfterDelais } from "./flexpaieAction";
import {
  PaymentFlexpaieDataType,
  PaymentFlexpaieResponseType,
} from "./OrderPaymentAction";
import { generateGameKey } from "@/utils/gamekey";
import {
  RANDO_ALLOWED_SHOP_SLUG,
  RANDO_GAME_PRICE_USD,
  RANDO_PRODUCT_NAME,
  normalizeHwid,
  validateHwid,
  validatePaymentNumber,
} from "@/utils/randonarando";

export type BuyGameKeyResult = {
  error: boolean;
  message: string;
  key?: {
    id: string;
    key: string;
    createdAt: string;
  };
};

type BuyGameKeyInput = {
  hwid: string;
  paymentNumber: string;
  shopSlug: string;
};

// Flexpaie annule tout processus de plus de 35 secondes.
// On limite l'attente à 28 secondes.
const PAYMENT_DEADLINE_MS = 28_000;
const POLL_DELAY_SECONDS = 3;

const isUniqueError = (e: unknown) =>
  typeof e === "object" &&
  e !== null &&
  (e as { code?: string }).code === "P2002";

const waitForPayment = async (
  paymentRef: string,
  startedAt: number,
): Promise<boolean> => {
  while (Date.now() - startedAt < PAYMENT_DEADLINE_MS) {
    const confirmed = await checkFlexpaiePaymentAfterDelais(
      paymentRef,
      POLL_DELAY_SECONDS,
    );

    if (confirmed) return true;
  }

  return false;
};

// -------- ACHAT D'UNE CLÉ D'ACTIVATION : RANDO NA RANDO --------

export const buyRandoNaRandoKey = async ({
  hwid: rawHwid,
  paymentNumber,
  shopSlug,
}: BuyGameKeyInput): Promise<BuyGameKeyResult> => {
  let transaction_id: string | undefined;

  try {
    // 1. UTILISATEUR
    const user = await getUser();

    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Accès refusé. Vous devez être connecté et autorisé pour continuer.",
      };
    }

    // 2. BOUTIQUE AUTORISÉE
    if (RANDO_ALLOWED_SHOP_SLUG && shopSlug !== RANDO_ALLOWED_SHOP_SLUG) {
      return {
        error: true,
        message: "Ce jeu n'est pas disponible dans cette boutique.",
      };
    }

    // 3. VALIDATION DU HWID
    const hwid = normalizeHwid(rawHwid ?? "");
    const hwidError = validateHwid(hwid);

    if (hwidError) {
      return { error: true, message: hwidError };
    }

    // 4. VALIDATION DU PRIX
    if (!Number.isFinite(RANDO_GAME_PRICE_USD) || RANDO_GAME_PRICE_USD < 0) {
      return {
        error: true,
        message: "Le prix du jeu est invalide.",
      };
    }

    // Le numéro est nécessaire uniquement pour un achat payant.
    const isFree = RANDO_GAME_PRICE_USD === 0;

    if (!isFree) {
      const paymentError = validatePaymentNumber(paymentNumber ?? "");

      if (paymentError) {
        return { error: true, message: paymentError };
      }
    }

    // 5. PRODUIT
    const product = await prisma.supplierProduct.findFirst({
      where: {
        name: {
          contains: RANDO_PRODUCT_NAME,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (!product) {
      return {
        error: true,
        message: "Le jeu n'est pas disponible pour le moment.",
      };
    }

    // 6. INITIALISATION DU PAIEMENT UNIQUEMENT SI LE JEU EST PAYANT
    transaction_id = v4().replace(/-/g, "");

    if (!isFree) {
      const currency = (await getCurrencySymbol()) === "$" ? "USD" : "CDF";

      const exchange = await exChangeRate();
      const amount = RANDO_GAME_PRICE_USD * exchange;

      if (!Number.isFinite(amount) || amount <= 0) {
        return {
          error: true,
          message: "Impossible de calculer le montant du paiement.",
        };
      }

      const baseUrl =
        process.env.NODE_ENV === "production"
          ? "https://otekis.com"
          : "http://localhost:3000";

      const flexpaieData: PaymentFlexpaieDataType = {
        merchant: FLEXPAIE_MERCHANT_CODE,
        type: "1",
        phone:
          paymentNumber.length === 9 ? "243" + paymentNumber : paymentNumber,
        reference: transaction_id,
        amount: amount.toString(),
        currency,
        callbackUrl: `${baseUrl}/${shopSlug}`,
      };

      // Le délai commence avant l'initialisation Flexpaie.
      const startedAt = Date.now();

      const response = await fetch(FLEXPAIE_URL_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLEXPAIE_TOKEN}`,
        },
        body: JSON.stringify(flexpaieData),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur d'initialisation Flexpaie : HTTP ${response.status}`,
        );
      }

      const dataResponse =
        (await response.json()) as PaymentFlexpaieResponseType;

      if (dataResponse.code !== "0" || !dataResponse.orderNumber) {
        return {
          error: true,
          message: `Le paiement a échoué : ${
            dataResponse.message || "Réponse Flexpaie invalide"
          }`,
        };
      }

      // La clé ne sera créée que si le paiement est confirmé.
      const isPaymentSuccessful = await waitForPayment(
        dataResponse.orderNumber,
        startedAt,
      );

      if (!isPaymentSuccessful) {
        return {
          error: true,
          message:
            "Le paiement n'a pas été confirmé. Veuillez vérifier votre transaction avant de réessayer.",
        };
      }
    }

    // 7. GÉNÉRATION DE LA CLÉ APRÈS CONFIRMATION
    // Si le jeu est gratuit, cette étape est exécutée sans paiement.
    // Sinon, elle n'est atteinte qu'après confirmation Flexpaie.
    let gameKey = generateGameKey(hwid);

    // 8. ENREGISTREMENT DE LA CLÉ
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const created = await prisma.gameAcccesKey.create({
            data: {
              productId: product.id,
              buyerId: user.id,
              key: gameKey,
            },
            select: {
              id: true,
              key: true,
              createdAt: true,
            },
          });

          return {
            error: false,
            message: isFree
              ? "Le jeu est gratuit, votre clé d'activation est prête."
              : "Paiement confirmé, votre clé d'activation est prête.",
            key: {
              id: created.id,
              key: created.key,
              createdAt: created.createdAt.toISOString(),
            },
          };
        } catch (e) {
          if (isUniqueError(e)) {
            gameKey = generateGameKey(hwid);
            continue;
          }

          throw e;
        }
      }

      throw new Error("Impossible d'enregistrer une clé unique");
    } catch (error) {
      console.error(
        isFree
          ? "ERREUR CRÉATION CLÉ GRATUITE"
          : "PAIEMENT RÉUSSI MAIS CLÉ NON CRÉÉE",
        {
          transaction_id,
          userId: user.id,
          hwid,
          error,
        },
      );

      return {
        error: true,
        message: isFree
          ? "Impossible de créer la clé. Veuillez réessayer ultérieurement."
          : `Votre paiement a été reçu mais la clé n'a pas pu être créée. Contactez le support avec cette référence : ${transaction_id}`,
      };
    }
  } catch (error) {
    console.error("Erreur achat clé Rando na Rando", error);

    return {
      error: true,
      message: "Impossible d'effectuer cette action, réessayez ultérieurement.",
    };
  }
};
