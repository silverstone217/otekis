"use client";
import {
  Cart,
  DeliveryCompany,
  Preferences,
  ProductShop,
  Shop,
} from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreditCard, FileText } from "lucide-react";
import { useCurrentUser } from "@/hooks/UserAuth";
import Image from "next/image";
import { returnDataValue, returnFormatedMoney } from "@/utils/functions";
import { ColorsData } from "@/utils/dataAdd";
import { PaiementCinetPay } from "./PayWithCinetPay";
import DeliveryChoiceComponent from "./DeliveryChoiceComponent";
import { deliveryPriceByDeliveryChoice } from "@/utils/delivery";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SmoothLink } from "@/components/SmoothLink";
import { luminanceColor } from "@/utils/shopFunctions";
import SelectZones from "./SelectZone";
import ChoiceDeliveryService from "./ChoiceDeliveryService";
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
  exchangeValue: number;
  deliveryService: DeliveryCompany[];
  cinetPayPercentage: number;
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
  exchangeValue,
  deliveryService,
  cinetPayPercentage,
}: Props) => {
  const user = useCurrentUser();

  const [receiver, setReceiver] = useState(user?.name ?? "");
  const [receiverPhone, setReceiverPhone] = useState(user?.tel ?? "");
  const [receiverAddress, setReceiverAddress] = useState(user?.address ?? "");
  const [description, setDescription] = useState("");
  const [isBuyingGeneralTermsAccepted, setIsBuyingGeneralTermsAccepted] =
    useState(user ? user.isBuyingGeneralTermsAccepted : false);
  const [isBuyingTermsAccepted, setIsBuyingTermsAccepted] = useState(false);
  useState(false);

  const [deliveryChoice, setDeliveryChoice] = useState("");
  const [deliveryPaymentMethode, setDeliveryPaymentMethode] = useState("");

  const QuantityOfArticlesToBuy = ArticlesToBuy.reduce(
    (acc, val) => acc + val.quantity,
    0
  );

  const [commune, setCommune] = useState("");
  const [quartier, setQuartier] = useState("");

  // const deliveryPrice = useMemo(() => {
  //   const nbr = deliveryPriceByDeliveryChoice({
  //     address: receiverAddress,
  //     deliveryChoice,
  //   });
  //   if (typeof nbr === "string") {
  //     return nbr;
  //   }
  //   return nbr * exchange;
  // }, [deliveryChoice, receiverAddress, exchange]);

  // Fetch delivery price
  const [deliveryPrice, setDeliveryPrice] = useState<
    "Zone non couverte" | "non-specifie" | number
  >("non-specifie");

  const totalAmountWithDeliveryPrice = useMemo(() => {
    if (
      typeof deliveryPrice === "number" &&
      deliveryPaymentMethode !== "cash"
    ) {
      return totalPrice + deliveryPrice;
    }
    return totalPrice;
  }, [deliveryPaymentMethode, deliveryPrice, totalPrice]);

  const deliveryChoiceSysteme = useMemo(
    () =>
      deliveryService.find((d) =>
        d.name.toLocaleLowerCase().includes(deliveryChoice.toLocaleLowerCase())
      ),
    [deliveryChoice, deliveryService]
  );

  // console.log(deliveryService, deliveryChoice, deliveryChoiceId);

  // LUMINANCE
  const luminance = useMemo(
    () => luminanceColor(preferences.background),
    [preferences.background]
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
                    luminance === "dark"
                      ? "rgba(256, 256, 256, 0.3)"
                      : "rgba(19, 19, 19, 0.3)",
                }}
              />
            </div>

            {/* Client Telephone */}
            <div className="w-full flex flex-col text-sm">
              <label
                htmlFor="recTel"
                className="text-gray-700 opacity-80 font-medium"
              >
                Téléphone du receveur *
              </label>

              <div className="w-full relative mt-1">
                {/* Préfixe fixe */}
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 
      text-gray-100 font-semibold tracking-wide text-sm 
      px-3 py-1 rounded-l-md border-r border-gray-300 select-none"
                  style={{
                    backgroundColor:
                      luminance === "light" ? "#3b3b3b" : "#e5e7eb",
                    color: luminance === "light" ? "white" : "#1f2937",
                  }}
                >
                  +243
                </span>

                {/* Champ de saisie */}
                <input
                  type="tel"
                  id="recTel"
                  name="recTel"
                  placeholder="817596369"
                  className="w-full border-b-2 border-gray-300 
      focus:border-blue-600 focus:outline-none py-2 pl-16
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
                      luminance === "dark"
                        ? "rgba(255, 255, 255, 0.15)"
                        : "rgba(19, 19, 19, 0.05)",
                  }}
                />
              </div>

              {/* Texte d’aide clair */}
              <p id="recTelHelp" className="text-xs text-gray-500 mt-1">
                Entrez uniquement les 9 chiffres après <strong>+243</strong>
                &nbsp;(ex. <span className="font-mono">817596369</span>).
              </p>
            </div>

            {/* Client address */}
            <div className="w-full flex flex-col text-sm">
              <label
                htmlFor="recAddress"
                className=" text-gray-700 opacity-80 font-medium"
              >
                Adresse de livraison *{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (Numéro, Avenue)
                </span>
              </label>
              <input
                type="text"
                id="recAddress"
                name="recAddress"
                placeholder="82, Busumelo"
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
                    luminance === "dark"
                      ? "rgba(256, 256, 256, 0.3)"
                      : "rgba(19, 19, 19, 0.3)",
                }}
              />

              <p id="recAddressHelp" className="mt-1 text-xs text-gray-400">
                Exemple : 82, Busu-melo
              </p>
            </div>

            {/* COMMUNE ET QUARTIER */}
            <SelectZones
              commune={commune}
              quartier={quartier}
              loading={false}
              setCommune={setCommune}
              setQuartier={setQuartier}
            />

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
                    luminance === "dark"
                      ? "rgba(256, 256, 256, 0.3)"
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
                    <p
                      className="opacity-75 text-xs capitalize flex 
                    items-center gap-2"
                    >
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
          <ChoiceDeliveryService
            deliveryChoice={deliveryChoice}
            setDeliveryChoice={setDeliveryChoice}
            preferences={preferences}
            commune={commune}
            quartier={quartier}
            deliveryPrice={deliveryPrice}
            setDeliveryPrice={setDeliveryPrice}
            deliveryService={deliveryService}
            setDeliveryPaymentMethode={setDeliveryPaymentMethode}
            currency={currency}
            exchange={exchange}
            exchangeValue={exchangeValue}
            cinetPayPercentage={cinetPayPercentage}
          />

          {/* <DeliveryChoiceComponent
            deliveryChoice={deliveryChoice}
            setDeliveryChoice={setDeliveryChoice}
            preferences={preferences}
            address={receiverAddress}
            deliveryService={deliveryService}
          /> */}

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
            <p className="text-base font-black flex items-center w-full justify-between">
              <span>Montant total</span>

              <span>
                {returnFormatedMoney(totalAmountWithDeliveryPrice)}{" "}
                <span className="text-xs"> {currency}</span>
              </span>
            </p>

            {deliveryPaymentMethode === "cash" && (
              <p className="text-xs text-destructive/80">
                {`Le paiement de la livraion s'est fait a la livraison`}
              </p>
            )}
          </div>

          {/* CGI Vente et Achat */}
          {user && user.isBuyingGeneralTermsAccepted === false && (
            <div
              className="w-full grid gap-4 p-4 border-2"
              style={{
                borderRadius: preferences.buttonRadius,
              }}
            >
              <div className="space-y-2 text-center md:text-left">
                <Label className="text-lg font-semibold flex items-center gap-2 justify-center md:justify-start">
                  <FileText
                    size={18}
                    className="text-muted-foreground shrink-0"
                  />
                  Accepter les termes et conditions d&apos;achat
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
                  Vous devez accepter nos termes et conditions avant de procéder
                  au paiement.
                </p>
                <SmoothLink href="/conditions-et-termes#boutique">
                  <span
                    className="font-medium hover:underline text-sm"
                    style={{ color: preferences.textColor }}
                  >
                    Lire les termes et conditions sur l&apos;achat
                  </span>
                </SmoothLink>
                <br />
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={isBuyingGeneralTermsAccepted}
                    onCheckedChange={(checked) =>
                      setIsBuyingGeneralTermsAccepted(checked)
                    }
                    // disabled={loading}
                    aria-label="Accepter les termes et conditions"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CGI Vente */}
          <div
            className="w-full grid gap-4 p-4 border-2"
            style={{
              borderRadius: preferences.buttonRadius,
            }}
          >
            <div className="space-y-2 text-center md:text-left">
              <Label className="text-lg font-semibold flex items-center gap-2 justify-center md:justify-start">
                <FileText
                  size={18}
                  className="text-muted-foreground shrink-0"
                />
                Accepter les termes et conditions sur la vente
                <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
                Vous devez accepter nos termes et conditions avant de procéder
                au paiement.
              </p>
              <SmoothLink href="/conditions-et-termes#boutique">
                <span
                  className="font-medium hover:underline text-sm"
                  style={{ color: preferences.textColor }}
                >
                  Lire les termes et conditions sur la vente
                </span>
              </SmoothLink>
              <br />
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={isBuyingTermsAccepted}
                  onCheckedChange={(checked) =>
                    setIsBuyingTermsAccepted(checked)
                  }
                  // disabled={loading}
                  aria-label="Accepter les termes et conditions"
                />
              </div>
            </div>
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
              address: `${receiverAddress}, ${quartier}, ${commune}`,
              tel: receiverPhone,
              description,
            }}
            deliveryPrice={
              deliveryChoiceSysteme?.validationPossible ? deliveryPrice : 0
            }
            deliveryPaymentMethode={deliveryPaymentMethode}
            ArticlesToBuy={ArticlesToBuy}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            deliveryChoiceId={deliveryChoiceSysteme?.id}
            currency={currency}
            setIsBuyingGeneralTermsAccepted={setIsBuyingGeneralTermsAccepted}
            setIsBuyingTermsAccepted={setIsBuyingTermsAccepted}
            isBuyingGeneralTermsAccepted={isBuyingGeneralTermsAccepted}
            isBuyingTermsAccepted={isBuyingTermsAccepted}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentSheetComponent;
