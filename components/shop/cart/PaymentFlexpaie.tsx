"use client";

import {
  canProcessOrder,
  CanProcessOrderType,
  newOrderAction,
  OrderCinetPaytype,
} from "@/actions/paimentActions";
import { useCurrentUser } from "@/hooks/UserAuth";
import { OrderStatusType, PaymentStatusType } from "@/types/orders";
import {
  Cart,
  Preferences,
  ProductShop,
  Shop,
} from "@/lib/generated/prisma/client";
import { CreditCard, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArticleToBuyType } from "./PaymentSheetComponent";
import { v4 as uuidv4 } from "uuid";
import { verifyAddressFormat } from "@/utils/delivery";
import {
  CINET_PAY_API_KEY,
  CINET_PAY_SITE_ID_CDF,
  CINET_PAY_SITE_ID_USD,
  FLEXPAIE_MERCHANT_CODE,
  FLEXPAIE_TOKEN,
  FLEXPAIE_URL_API,
  FLEXPAIE_URL_API_CHECK_ORDER,
} from "@/utils/envVariables";
import { SheetClose } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { PaymentMethodOrder } from "@/lib/generated/prisma/enums";
import { checkFlexpaiePaymentAfterDelais } from "@/actions/flexpaieAction";
import {
  handleServerPayment,
  ServerPaymentType,
} from "@/actions/OrderPaymentAction";

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
  setIsBuyingGeneralTermsAccepted: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  deliveryPaymentMethode: string;
  setIsBuyingTermsAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  isBuyingGeneralTermsAccepted: boolean;
  isBuyingTermsAccepted: boolean;
  setIsBuying: React.Dispatch<React.SetStateAction<boolean>>;
  isBuying: boolean;
  isValidAddress: boolean;
  paymentMethod: PaymentMethodOrder;
};

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

const PaymentFlexpaie = ({
  shop,
  shopPreferences,
  totalPrice,
  receiverInfo,
  deliveryPrice,
  ArticlesToBuy,
  setModalOpen,
  deliveryChoiceId,
  currency,
  isBuyingGeneralTermsAccepted,
  isBuyingTermsAccepted,
  setIsBuyingGeneralTermsAccepted,
  setIsBuyingTermsAccepted,
  deliveryPaymentMethode,
  isBuying,
  setIsBuying,
  isValidAddress,
  paymentMethod,
}: Props) => {
  // const [isCinetPayReady, setIsCinetPayReady] = useState(false);
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://otekis.com"
      : "http://localhost:3000";

  const notify_url = `${baseUrl}/panier`;
  const flexpaieApiToken = FLEXPAIE_TOKEN;
  const flexpaieApiUrl = FLEXPAIE_URL_API;
  const currencyMoney = currency === "$" ? "USD" : "CDF";

  const user = useCurrentUser();

  const userName = user?.name?.split(" ")[0];
  const userLastName = user?.name?.split(" ")[1];

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isBuying) return;

      event.preventDefault();

      // OBLIGATOIRE pour Chrome / Edge
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isBuying]);

  useEffect(() => {
    if (!isBuying) return;

    const originalPush = router.push;

    router.push = (...args) => {
      toast.warning(
        "Un paiement est en cours. Veuillez attendre sa confirmation."
      );
    };

    return () => {
      router.push = originalPush;
    };
  }, [isBuying]);

  if (!user) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setIsBuying(true);

    try {
      toast.info(
        "Vous avez 30 secondes pour valider le paiement sur votre mobile."
      );

      toast.info("Paiement en cours de traitement, veuillez patienter...");

      toast.info("Valider le paiement sur votre mobile.");

      // after payment make order
      const formData: ServerPaymentType = {
        ArticlesToBuy,
        totalPrice,
        deliveryPrice,
        receiverInfo,
        deliveryPaymentMethode,
        currencyMoney,
        deliveryChoiceId,
        CanProcessPayment: {
          isBuyingGeneralTermsAccepted,
          isBuyingTermsAccepted,
        },
        shop,
      };

      const result = await handleServerPayment(formData);

      if (result.error) {
        toast.error(result.message);
        return;
      }

      toast.success(
        "Votre paiement a été effectué avec succès, en attente de validation de la commande"
      );
      setIsBuyingGeneralTermsAccepted(false);
      setIsBuyingTermsAccepted(false);
      router.refresh();

      setModalOpen(true);
    } catch (error: any) {
      console.error(error);
      toast.error("Une erreur est survenue lors du paiement", {
        description: error.message || "Veuillez réessayer plus tard.",
      });
    } finally {
      setLoading(false);
      setIsBuying(false);
    }
  };

  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-2 mt-6 py-3 hover:opacity-70
    transition-all duration-500 ease-in-out hover:shadow-2xl shadow-md opacity-90
    disabled:opacity-60
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
        typeof deliveryPrice === "string" ||
        receiverInfo.tel.length !== 9 ||
        !isValidAddress ||
        !isBuyingTermsAccepted
        // !isBuyingGeneralTermsAccepted
      }
    >
      {loading ? (
        <Loader className="w-8 h-8 animate-spin" />
      ) : (
        <CreditCard className="w-8 h-8" />
      )}
      <span>
        {!loading ? "Payer maintenant " : "en cours de traitement...."}
      </span>
    </button>
  );
};

export default PaymentFlexpaie;
