/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  canProcessOrder,
  CanProcessOrderType,
  newOrderAction,
  OrderCinetPaytype,
} from "@/actions/paimentActions";
import { useCurrentUser } from "@/hooks/UserAuth";
import { OrderStatusType, PaymentStatusType } from "@/types/orders";
import { Cart, Preferences, ProductShop, Shop } from "@prisma/client";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ArticleToBuyType } from "./PaymentSheetComponent";
import { v4 as uuidv4 } from "uuid";
import { verifyAddressFormat } from "@/utils/delivery";
import {
  CINET_PAY_API_KEY,
  CINET_PAY_SITE_ID_CDF,
  CINET_PAY_SITE_ID_USD,
} from "@/utils/envVariables";

declare global {
  interface Window {
    CinetPay: any;
  }
}

type Props = {
  shop: Shop;
  //   products: ProductWthArticle[];
  shopPreferences: Preferences;
  productsShop: ProductShop[];
  carts: Cart[];
  isUserShopBanned: boolean;
  isUserBanned: boolean;
  totalPrice: number;
  receiverInfo: {
    tel: string;
    name: string;
    address: string;
    description?: string;
  };
  deliveryPrice: number | string;
  ArticlesToBuy: ArticleToBuyType[];
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalOpen: boolean;
  deliveryChoiceId: string | undefined;
  currency: "$" | "CDF";
};

export function PaiementCinetPay({
  shop,
  shopPreferences,
  totalPrice,
  receiverInfo,
  deliveryPrice,
  ArticlesToBuy,
  setModalOpen,
  deliveryChoiceId,
  currency,
}: Props) {
  const [isCinetPayReady, setIsCinetPayReady] = useState(false);
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://otekis.vercel.app"
      : "http://localhost:3000";

  const notify_url = `${baseUrl}/api/cinetpay/notify`;
  const cinetPayApiKey = CINET_PAY_API_KEY;
  const cinetPaySiteId =
    currency === "$" ? CINET_PAY_SITE_ID_USD! : CINET_PAY_SITE_ID_CDF;
  const currencyMoney = currency === "$" ? "USD" : "CDF";

  const user = useCurrentUser();

  const userName = user?.name?.split(" ")[0];
  const userLastName = user?.name?.split(" ")[1];

  const [status] = useState<OrderStatusType>("en cours de traitement");
  const [PaymentStatus] = useState<PaymentStatusType>("payé");

  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleCheckout = async () => {
    setLoading(true);

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
      toast.error("Impossible d'effectuer cette action!", {
        description: canProcessPayment,
      });
      setLoading(false);
      return;
    }
    console.log(canProcessPayment);

    if (!window.CinetPay) {
      toast.error("Le module de paiement n'est pas chargé");
      setLoading(false);
      return;
    }

    // Start with CinetPay
    window.CinetPay.setConfig({
      apikey: cinetPayApiKey,
      site_id: cinetPaySiteId,
      notify_url: notify_url,
      mode: "PRODUCTION",
    });

    // const transaction_id = Math.floor(Math.random() * 100000000).toString();
    const transaction_id = uuidv4().toString().replace(/-/g, "");

    // Fonction qui retourne une promesse qui se résout à la réponse du paiement
    const paymentPromise = new Promise<{
      status: string;
      description?: string;
    }>((resolve, reject) => {
      // check if deliery is not a string
      if (typeof deliveryPrice === "string") {
        // setLoading(false);
        return;
      }
      window.CinetPay.getCheckout({
        transaction_id,
        amount: totalPrice + deliveryPrice,
        currency: currencyMoney,
        channels: "ALL",
        description: "Achat d'article",
        customer_name: userName,
        customer_surname: userLastName,
        customer_email: user.email,
        customer_phone_number: user.tel ?? receiverInfo.tel,
        customer_address: user.address ?? receiverInfo.address,
        customer_city: "Kinshasa",
        customer_country: "CD",
        customer_state: "Kinshasa",
        customer_zip_code: "06510",
      });

      window.CinetPay.waitResponse((data: any) => {
        if (data.status === "REFUSED") {
          resolve({ status: "REFUSED", description: data.description });
        } else if (data.status === "ACCEPTED") {
          resolve({ status: "ACCEPTED" });
        } else {
          // Autres statuts possibles
          reject(new Error("Statut de paiement inconnu"));
        }
      });

      window.CinetPay.onError((error: any) => {
        reject(new Error(error.description || "Erreur de paiement"));
      });
    });

    try {
      // check if deliery is not a string
      if (typeof deliveryPrice === "string") {
        // setLoading(false);
        return;
      }

      // check if the address is a correct format
      const isAddressCorrect = verifyAddressFormat(receiverInfo.address);
      if (!isAddressCorrect) {
        // setLoading(false);
        toast.error(isAddressCorrect);
        return;
      }

      const paymentResult = await paymentPromise;

      if (paymentResult.status === "REFUSED") {
        alert("Votre paiement a échoué : " + paymentResult.description);
        return;
      }

      // Paiement accepté, préparer les données de commande

      // after payment make order
      const formData: OrderCinetPaytype = {
        totalAmount: totalPrice,
        deliveryPrice,
        paymentRef: transaction_id,
        status,
        paymentStatus: PaymentStatus,

        receiverAddress: receiverInfo.address,
        receiverName: receiverInfo.name,
        receiverTel: receiverInfo.tel,
        description: receiverInfo.description,
        deliveryChoiceId: deliveryChoiceId ?? undefined,

        paymentMethod: "cinetpay",
        shopId: shop.id,

        orderItems,
      };

      toast.success(
        "Votre paiement a été effectué avec succès, en attente de validation de la commande"
      );

      const result = await newOrderAction(formData);

      if (result.error) {
        toast.error("Une erreur est survenue", { description: result.message });
        return;
      }
      toast.success(result.message);

      setModalOpen(true);

      // Optionnel : redirection ou mise à jour UI
      // router.push("/commande/success");
    } catch (error: any) {
      console.error(error);
      toast.error("Une erreur est survenue lors du paiement", {
        description: error.message || "Veuillez réessayer plus tard.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-4 mt-6 py-3 hover:opacity-75
    transition-all duration-500 ease-in-out hover:shadow-2xl shadow-md
    disabled:opacity-70
    "
        style={{
          backgroundColor: shopPreferences.buttonColor,
          color: shopPreferences.buttonTextColor,
          borderRadius: shopPreferences.buttonRadius,
        }}
        onClick={handleCheckout}
        disabled={
          loading ||
          !user ||
          user.isBanned ||
          !receiverInfo.address ||
          !receiverInfo.tel ||
          !receiverInfo.name ||
          typeof deliveryPrice === "string"
        }
      >
        <span>
          {!loading ? "Payer maintenant" : "en cours de traitement...."}
        </span>
        <CreditCard className="w-8 h-8 ml-2" />
      </button>
    </>
  );
}
