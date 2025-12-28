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
import {
  Cart,
  Preferences,
  ProductShop,
  Shop,
} from "@/lib/generated/prisma/client";
import { CreditCard, Loader } from "lucide-react";
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
import { SheetClose } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { PaymentMethodOrder } from "@/lib/generated/prisma/enums";

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

const PaymentWithCash = ({
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
  const currencyMoney = currency === "$" ? "USD" : "CDF";

  const user = useCurrentUser();

  const userName = user?.name?.split(" ")[0];
  const userLastName = user?.name?.split(" ")[1];

  const [status] = useState<OrderStatusType>("en cours de traitement");
  const [PaymentStatus] = useState<PaymentStatusType>("payé");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!user) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setIsBuying(true);

    if (!isBuyingGeneralTermsAccepted) {
      toast.error("Vous devez accepter les termes et conditions d'achat.");
      setLoading(false);
      setIsBuying(false);
      return; // arrête proprement la fonction
    }

    if (!isBuyingTermsAccepted) {
      toast.error("Vous devez accepter les conditions de vente.");
      setLoading(false);
      setIsBuying(false);
      return; // arrête proprement la fonction
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
      toast.error("Impossible d'effectuer cette action!", {
        description: canProcessPayment,
      });
      setLoading(false);
      setIsBuying(false);
      return;
    }
    console.log(canProcessPayment);

    // Start with CinetPay

    // const transaction_id = Math.floor(Math.random() * 100000000).toString();
    const transaction_id = "CASH-1234";

    // Fonction qui retourne une promesse qui se résout à la réponse du paiement

    try {
      // check if deliery is not a string
      if (typeof deliveryPrice === "string") {
        // setLoading(false);
        return;
      }

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

        isBuyingGeneralTermsAccepted,

        paymentMethod: "cash",
        shopId: shop.id,

        orderItems,
      };

      const result = await newOrderAction(formData);

      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success(
        "Votre commande a été effectuée avec succès, en attente de validation de la commande"
      );
      setIsBuyingGeneralTermsAccepted(false);
      setIsBuyingTermsAccepted(false);

      router.refresh();

      setModalOpen(true);

      // Optionnel : redirection ou mise à jour UI
      // router.push("/commande/success");
    } catch (error: any) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la commande", {
        description: error.message || "Veuillez réessayer plus tard.",
      });
    } finally {
      setLoading(false);
      setIsBuying(false);
    }
  };

  return (
    <SheetClose asChild>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 mt-6 py-3 hover:opacity-75
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
          {!loading ? "commander maintenant" : "en cours de traitement...."}
        </span>
      </button>
    </SheetClose>
  );
};

export default PaymentWithCash;
