"use client";
import {
  Cart,
  DeliveryCompany,
  Preferences,
  ProductShop,
  Shop,
} from "@prisma/client";
import React, { useMemo, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreditCard } from "lucide-react";
import { useCurrentUser } from "@/hooks/UserAuth";
import Image from "next/image";
import { returnDataValue, returnFormatedMoney } from "@/utils/functions";
import { ColorsData } from "@/utils/dataAdd";
import { PaiementCinetPay } from "./PayWithCinetPay";
import DeliveryChoiceComponent from "./DeliveryChoiceComponent";
import { deliveryPriceByDeliveryChoice } from "@/utils/delivery";

export type ArticleToBuyType = {
  productId: string;
  articleId: string;
  quantity: number;
  MinPrice: number;
  totalPriceAfterDiscount: number;
  totalTotalPriceAfterDiscount: number;
  totalPrice: number;
  uniquePrice: number;
  productName: string;
  productColor: string | null;
  productSize: string | null;
  productImage: string;
};

type Props = {
  shop: Shop;
  //   products: ProductWthArticle[];
  shopPreferences: Preferences;
  productsShop: ProductShop[];
  carts: Cart[];
  isUserShopBanned: boolean;
  isUserBanned: boolean;
  totalPrice: number;
  ArticlesToBuy: ArticleToBuyType[];
  deliveryPrice: number;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalOpen: boolean;
  currency: "$" | "CDF";
  exchange: number;
  deliveryService: DeliveryCompany[];
};

const PaymentSheetComponent = ({
  shop,
  //   products,
  shopPreferences: preferences,
  productsShop,
  carts,
  isUserShopBanned,
  isUserBanned,
  totalPrice,
  ArticlesToBuy,
  setModalOpen,
  modalOpen,
  currency,
  exchange,
  deliveryService,
}: Props) => {
  const user = useCurrentUser();

  const [receiver, setReceiver] = useState(user?.name ?? "");
  const [receiverPhone, setReceiverPhone] = useState(user?.tel ?? "");
  const [receiverAddress, setReceiverAddress] = useState(user?.address ?? "");
  const [description, setDescription] = useState("");

  const [deliveryChoice, setDeliveryChoice] = useState("");

  const QuantityOfArticlesToBuy = ArticlesToBuy.reduce(
    (acc, val) => acc + val.quantity,
    0
  );

  const deliveryPrice = useMemo(() => {
    const nbr = deliveryPriceByDeliveryChoice({
      address: receiverAddress,
      deliveryChoice,
    });
    if (typeof nbr === "string") {
      return nbr;
    }
    return nbr * exchange;
  }, [deliveryChoice, receiverAddress, exchange]);

  const totalAmountWithDeliveryPrice = useMemo(() => {
    if (typeof deliveryPrice === "number") {
      return totalPrice + deliveryPrice;
    }
    return totalPrice;
  }, [deliveryPrice, totalPrice]);

  const deliveryChoiceId = useMemo(
    () =>
      deliveryService.find((d) =>
        d.name.toLocaleLowerCase().includes(deliveryChoice.toLocaleLowerCase())
      )?.id,
    [deliveryChoice, deliveryService]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-4 mt-6 py-3 hover:opacity-75
  transition-all duration-500 ease-in-out hover:shadow-2xl shadow-md
  "
          style={{
            backgroundColor: preferences.buttonColor,
            color: preferences.buttonTextColor,
            borderRadius: preferences.buttonRadius,
          }}
        >
          <span>Payer</span>
          <CreditCard className="w-8 h-8 ml-2" />
        </button>
      </SheetTrigger>
      <SheetContent
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
          borderColor: preferences.background,
        }}
        className="max-h-[100dvh] overflow-x-hidden overflow-y-auto w-full"
      >
        <SheetHeader
          style={{ borderColor: "dimgray" }}
          className="border-b-2 pb-4"
        >
          <SheetTitle
            style={{ color: preferences.textColor }}
            className="text-xl font-bold opacity-80 uppercase text-center text-pretty"
          >
            {`Achat d'articles`}
          </SheetTitle>
          <SheetDescription hidden>Payer les produits</SheetDescription>
        </SheetHeader>

        {/* content */}
        <div className="w-full grid gap-4 p-4">
          {/* Client info */}

          <div
            className="w-full grid gap-4 p-4 border-2"
            style={{
              borderRadius: preferences.buttonRadius,
            }}
          >
            {/* Client Name */}
            <div className="w-full flex flex-col text-sm">
              <label
                htmlFor="recName"
                className=" text-gray-700 opacity-80 font-medium"
              >
                Noms du receiveur *
              </label>
              <input
                type="text"
                id="recName"
                name="recName"
                placeholder="John Doe"
                className="w-full border-b-2 border-gray-300 
                focus:border-blue-600 focus:outline-none py-2 
              transition-colors !bg-transparent"
                defaultValue={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby="recNameHelp"
                style={{
                  color: preferences.textColor,
                  backgroundColor:
                    preferences.background === "#ffffff"
                      ? "transparent"
                      : "rgba(19, 19, 19, 0.3)",
                }}
              />
            </div>

            {/* Client Name */}
            <div className="w-full flex flex-col text-sm">
              <label
                htmlFor="recTel"
                className=" text-gray-700 opacity-80 font-medium"
              >
                Telephone du receiveur *{" "}
                <span className="text-xs text-gray-500 font-normal">
                  +(243)
                </span>
              </label>
              <input
                type="tel"
                id="recTel"
                name="recTel"
                placeholder="817596369"
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none py-2 
              transition-colors"
                defaultValue={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby="recTelHelp"
                minLength={9}
                maxLength={9}
                style={{
                  color: preferences.textColor,
                  backgroundColor:
                    preferences.background === "#ffffff"
                      ? "transparent"
                      : "rgba(19, 19, 19, 0.3)",
                }}
              />
            </div>

            {/* Client address */}
            <div className="w-full flex flex-col text-sm">
              <label
                htmlFor="recAddress"
                className=" text-gray-700 opacity-80 font-medium"
              >
                Adresse de livraison *{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (Numéro, Avenue, Commune, Ville, Pays)
                </span>
              </label>
              <input
                type="text"
                id="recAddress"
                name="recAddress"
                placeholder="82, Busumelo, Kasa-Vubu, Kinshasa, RDC"
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none py-2 
              transition-colors "
                defaultValue={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby="recAddressHelp"
                style={{
                  color: preferences.textColor,
                  backgroundColor:
                    preferences.background === "#ffffff"
                      ? "transparent"
                      : "rgba(19, 19, 19, 0.3)",
                }}
              />

              <p id="recAddressHelp" className="mt-1 text-xs text-gray-400">
                Exemple : 82, Busumelo, Kasa-Vubu, Kinshasa, RDC
              </p>
            </div>

            {/* descrition */}

            <div className="w-full flex flex-col text-sm">
              <label
                htmlFor="recDesc"
                className=" text-gray-700 opacity-80 font-medium"
              >
                Description{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (optionnel)
                </span>
              </label>
              <textarea
                id="recDesc"
                name="recDesc"
                placeholder="specifier comment vous livrer ou un mot additionnel"
                className="w-full border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none py-2 
              transition-colors resize-none h-24"
                defaultValue={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby="recDescHelp"
                style={{
                  color: preferences.textColor,
                  backgroundColor:
                    preferences.background === "#ffffff"
                      ? "transparent"
                      : "rgba(19, 19, 19, 0.3)",
                }}
                maxLength={400}
              />
            </div>
          </div>

          <div
            className="w-full grid gap-4 p-4 border-2"
            style={{
              borderRadius: preferences.buttonRadius,
            }}
          >
            <h2 className="uppercase pb-2 border-b text-sm font-bold">
              Les produits
            </h2>

            <div className="w-full grid gap-4">
              {ArticlesToBuy.map((product, index) => (
                <div
                  key={index}
                  className="w-full flex items-center gap-4 text-sm"
                >
                  <Image
                    src={product.productImage}
                    alt={product.productName}
                    width={40}
                    height={40}
                    className=" object-cover h-20 w-16"
                    style={{
                      borderRadius: preferences.buttonRadius,
                    }}
                  />
                  <div className="flex-1 flex flex-col gap-1">
                    <h4 className="capitalize font-medium line-clamp-2">
                      {product.productName}
                    </h4>
                    <p className="opacity-75 text-xs capitalize flex items-center gap-2">
                      <span>{product.productSize}</span>
                      <span>
                        {product.productColor &&
                          returnDataValue(product.productColor, ColorsData)}
                      </span>

                      <span>
                        {product.quantity}{" "}
                        {product.quantity > 1 ? "pieces" : "piece"}
                      </span>
                    </p>
                    <p className="font-bold text-sm tabular-nums">
                      {returnFormatedMoney(
                        product.totalPriceAfterDiscount * exchange
                      )}{" "}
                      <span className="text-xs"> {currency}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* delivery choice */}
          <DeliveryChoiceComponent
            deliveryChoice={deliveryChoice}
            setDeliveryChoice={setDeliveryChoice}
            preferences={preferences}
            address={receiverAddress}
            deliveryService={deliveryService}
          />

          {/* pay */}
          <div
            className="w-full grid gap-4 p-4 border-2"
            style={{
              borderRadius: preferences.buttonRadius,
            }}
          >
            {/* items amounts */}
            <p className="text-sm font-medium flex items-center w-full justify-between">
              <span>
                {QuantityOfArticlesToBuy.toString().padStart(2, "0")} articles
              </span>

              <span>
                {returnFormatedMoney(totalPrice)}{" "}
                <span className="text-xs"> {currency}</span>
              </span>
            </p>

            {/* delivery amount */}
            <p className="text-sm  flex items-center w-full justify-between">
              <span>Livraison</span>
              {typeof deliveryPrice === "number" ? (
                <span>
                  {returnFormatedMoney(deliveryPrice)}{" "}
                  <span className="text-xs"> {currency}</span>
                </span>
              ) : (
                <span className="text-gray-500 text-right">
                  {" "}
                  {deliveryPrice}
                </span>
              )}
            </p>

            {/* total amount */}
            <p className="text-sm font-black flex items-center w-full justify-between">
              <span>Montant total</span>

              <span>
                {returnFormatedMoney(totalAmountWithDeliveryPrice)}{" "}
                <span className="text-xs"> {currency}</span>
              </span>
            </p>
          </div>

          {/* payment btn  */}
          <PaiementCinetPay
            carts={carts}
            isUserBanned={isUserBanned}
            isUserShopBanned={isUserShopBanned}
            productsShop={productsShop}
            shop={shop}
            shopPreferences={preferences}
            totalPrice={totalPrice}
            receiverInfo={{
              name: receiver,
              address: receiverAddress,
              tel: receiverPhone,
              description,
            }}
            deliveryPrice={deliveryPrice}
            ArticlesToBuy={ArticlesToBuy}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            deliveryChoiceId={deliveryChoiceId}
            currency={currency}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentSheetComponent;
