"use server";

import { ArticleToBuyType } from "@/components/shop/cart/PaymentSheetComponent";
import {
  canProcessOrder,
  CanProcessOrderType,
  newOrderAction,
  OrderCinetPaytype,
} from "./paimentActions";
import { getUser } from "./actions";
import { Shop } from "@/lib/generated/prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  FLEXPAIE_MERCHANT_CODE,
  FLEXPAIE_TOKEN,
  FLEXPAIE_URL_API,
} from "@/utils/envVariables";
import { checkFlexpaiePaymentAfterDelais } from "./flexpaieAction";

export interface PaymentFlexpaieDataType {
  merchant: string;
  type: "1" | "2";
  phone: string;
  reference: string;
  amount: string;
  currency: "CDF" | "USD";
  callbackUrl: string;
}

export interface PaymentFlexpaieResponseType {
  code: "0" | "1";
  message: string;
  orderNumber: string;
}

export type ServerPaymentType = {
  CanProcessPayment: {
    isBuyingGeneralTermsAccepted: boolean;
    isBuyingTermsAccepted: boolean;
  };
  ArticlesToBuy: ArticleToBuyType[];
  deliveryPrice: string | number;
  // formData: OrderCinetPaytype;
  shop: Shop;
  deliveryPaymentMethode: string;
  totalPrice: number;
  receiverInfo: {
    tel: string;
    name: string;
    address: string;
    description?: string;
  };
  currencyMoney: "CDF" | "USD";
  deliveryChoiceId: string | undefined;
};

export const handleServerPayment = async (data: ServerPaymentType) => {
  try {
    const {
      shop,
      ArticlesToBuy,
      deliveryChoiceId,
      totalPrice,
      deliveryPaymentMethode,
      deliveryPrice,
      receiverInfo,
      currencyMoney,
    } = data;
    // check user auth
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message: "Utilisateur non authentifié ou banni",
        data: null,
      };
    }

    // check if terms are accepted
    if (
      !data.CanProcessPayment.isBuyingGeneralTermsAccepted ||
      !data.CanProcessPayment.isBuyingTermsAccepted
    ) {
      return {
        error: true,
        message: "Les conditions d'achat doivent être acceptées",
        data: null,
      };
    }

    // check if deliveryPrice is valid and is number
    if (typeof deliveryPrice !== "number" || isNaN(deliveryPrice)) {
      return {
        error: true,
        message: "Le prix de livraison est invalide",
        data: null,
      };
    }

    const orderItems = ArticlesToBuy.map((item) => ({
      quantity: item.quantity,
      price: item.uniquePrice,
      articleId: item.articleId,
      productId: item.productId,
    }));

    const formDataPayment: CanProcessOrderType = {
      item: orderItems,
      shopId: shop.id,
    };

    // verify stock or Article, is a shop not banned or exist and if product is not avaiable
    const canProcessPayment = await canProcessOrder(formDataPayment);

    if (canProcessPayment !== "success") {
      console.log(canProcessPayment);

      return {
        error: true,
        message: `${canProcessPayment}`,
        data: null,
      };
    }

    // proceed to create order
    const transaction_id = uuidv4().toString().replace(/-/g, "");
    const flexpaieApiToken = FLEXPAIE_TOKEN;
    const flexpaieApiUrl = FLEXPAIE_URL_API;

    // URL to notify
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://otekis.com"
        : "http://localhost:3000";

    const notify_url = `${baseUrl}/panier`;

    // AMOUNT BASED ON DELIVERY METHOD
    const amount =
      deliveryPaymentMethode === "cash"
        ? totalPrice
        : totalPrice + deliveryPrice;

    // FLEXPAIE PAYMENT DATA
    const flexpaieData: PaymentFlexpaieDataType = {
      merchant: FLEXPAIE_MERCHANT_CODE,
      type: "1",
      phone:
        receiverInfo.tel.length === 9
          ? "243" + receiverInfo.tel
          : receiverInfo.tel,
      reference: transaction_id,
      amount: amount.toString(),
      currency: currencyMoney,
      callbackUrl: notify_url,
    };

    // call flexpaie api to init payment
    const response = await fetch(flexpaieApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flexpaieApiToken}`,
      },
      body: JSON.stringify(flexpaieData),
    });

    // console.log("Flexpaie response:", response);

    if (!response.ok) {
      throw new Error("Erreur lors de l'initialisation du paiement");
    }

    //   GET RESPONSE
    const dataResponse = (await response.json()) as PaymentFlexpaieResponseType;

    // console.log("Flexpaie data:", data);

    // Paiement accepté, préparer les données de commande
    const paymentCode = dataResponse.code;

    if (paymentCode !== "0") {
      return {
        error: true,
        message: `Le paiement a échoué: ${dataResponse.message}`,
        data: null,
      };
    }

    const paymentRef = dataResponse.orderNumber;

    // WAIT 30 SECONDS BEFORE CALLING THE NEW ORDER ACTION TO ENSURE PAYMENT IS PROCESSED
    const isPaymentSuccessful = await checkFlexpaiePaymentAfterDelais(
      paymentRef,
      35
    );
    if (!isPaymentSuccessful) {
      return {
        error: true,
        message: "Le paiement n'a pas été confirmé. Veuillez réessayer.",
        data: null,
      };
    }

    // after payment make order
    const formData: OrderCinetPaytype = {
      totalAmount: totalPrice,
      deliveryPrice,
      paymentRef: paymentRef || transaction_id,
      status: "en cours de traitement",
      paymentStatus: "payé",

      receiverAddress: receiverInfo.address,
      receiverName: receiverInfo.name,
      receiverTel: receiverInfo.tel,
      description: receiverInfo.description,
      deliveryChoiceId: deliveryChoiceId ?? undefined,

      isBuyingGeneralTermsAccepted:
        data.CanProcessPayment.isBuyingGeneralTermsAccepted,

      paymentMethod: "flexpaie",
      shopId: shop.id,

      orderItems,
    };

    const result = await newOrderAction(formData);
    if (result.error) {
      return {
        error: true,
        message: result.message || "Erreur lors de la création de la commande",
        data: null,
      };
    }

    return {
      error: false,
      message:
        "Votre paiement a été effectué avec succès, en attente de validation de la commande",
      data: {
        paymentRef,
      },
    };
  } catch (error) {
    console.error("Erreur lors du traitement du paiement Flexpaie:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors du traitement du paiement.",
      data: null,
    };
  }
};
