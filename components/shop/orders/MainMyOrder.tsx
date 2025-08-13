"use client";
import { Preferences, Shop } from "@prisma/client";
import {
  ChevronRight,
  House,
  User,
  Package,
  FileText,
  Truck,
  DollarSign,
  SquarePen,
  CircleX,
  MessageCircleQuestion,
  BanknoteArrowDown,
  Check,
  Copy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CancelOderType,
  cancelOrderByUser,
  modifyUserInfoOrder,
  ModifyUserInfoOrdertype,
  OrderWithProductDetails,
  updateCancelOrderByUser,
} from "@/actions/myOrderAction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { isEmptyString, returnFormatedMoney } from "@/utils/functions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GenerateSecret from "./OrderSecretComponent";

interface MainOrderProps {
  myOrder: OrderWithProductDetails;
  shopPreferences: Preferences;
  shop: Shop;
  currency: "$" | "CDF";
  exchange: number;
  deliveryInfo: {
    delivery: string;
    phone: string | undefined;
    isOtekisDelivery: boolean;
  } | null;
}

const MainMyOrder = ({
  myOrder,
  shopPreferences,
  shop,
  exchange,
  currency,
  deliveryInfo,
}: MainOrderProps) => {
  const Header = shopPreferences?.Header ?? "0";
  const shopUrl = `/${shop.slug}`;
  const router = useRouter();

  // refund
  const [refundPhoneNumber, setRefundPhoneNumber] = useState(
    myOrder.refundPhoneNumber ?? ""
  );
  const [refundReceiverName, setRefundReceiverName] = useState(
    myOrder.refundReceiverName ?? ""
  );
  const [paymentMethodRefund] = useState(
    myOrder.paymentMethodRefund ?? "mpesa"
  );

  // Calcul total articles
  const totalArticles = myOrder.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // Couleurs et styles personnalisés
  const borderColor = shopPreferences.buttonColor ?? "#3b82f6"; // fallback bleu
  const borderRadius = shopPreferences.buttonRadius ?? "0.5rem";

  // Cancel order
  const handleCancelOrder = async () => {
    const formData: CancelOderType = {
      orderId: myOrder.id,
      status: "en cours d'annulation",
      paymentMethodRefund,
      refundPhoneNumber: refundPhoneNumber.trim(),
      refundReceiverName: refundReceiverName.trim().toLocaleLowerCase(),
    };
    const result = await cancelOrderByUser(formData);
    if (result.error) {
      toast.error(result.message);
      return;
    }
    toast.success("Commande est en cours d'annulation");
    router.refresh();
  };

  // update cancel order
  const handleUpdateCancelOrder = async () => {
    const formData: CancelOderType = {
      orderId: myOrder.id,
      status: "en cours d'annulation",
      paymentMethodRefund,
      refundPhoneNumber: refundPhoneNumber.trim(),
      refundReceiverName: refundReceiverName.trim().toLocaleLowerCase(),
    };
    const result = await updateCancelOrderByUser(formData);
    if (result.error) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  };

  const currencyOrder = myOrder.currency === "USD" ? "$" : "CDF";

  return (
    <div
      className={`max-w-7xl mx-auto px-4 ${
        Number(Header) === 3 ? "pt-24" : "pt-8"
      }`}
    >
      {/* Header */}
      <div className="text-center mb-8 space-y-1">
        <CopyableOrderId orderId={myOrder.id} />
        {myOrder.ShipmentNumber && (
          <h1 className="text-sm font-light text-muted-foreground">
            Numero de suivi {myOrder.ShipmentNumber}
          </h1>
        )}
        <h2 className="text-2xl font-semibold capitalize">{myOrder.status}</h2>
        <p className="text-xs text-muted-foreground">
          Fait le{" "}
          {myOrder.createdAt.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Infos livraison & client */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-3xl mx-auto mb-10">
        <Card
          style={{ borderColor, borderRadius }}
          className="border shadow-sm"
        >
          <CardContent className="space-y-6 pt-4">
            {/* Adresse */}
            <div className="flex items-start gap-4 relative">
              <House className="text-muted-foreground w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Adresse de livraison
                </p>
                <p className="mt-1 text-sm">{myOrder.receiverAddress}</p>
              </div>
            </div>
            {/* Receiver */}
            <div className="flex items-start gap-4">
              <User className="text-muted-foreground w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Receveur
                </p>
                <p className="mt-1 text-sm">{myOrder.receiverName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  +243 {myOrder.receiverTel}
                </p>
              </div>
            </div>
            <Separator />
            {/* buttons and action */}
            <div className="grid grid-cols-2 items-center justify-between gap-2 flex-wrap">
              {/* modify order */}
              <ModifyOrderUserInfo
                myOrder={myOrder}
                shop={shop}
                shopPreferences={shopPreferences}
              />

              {/* cancel */}
              <CancelOrderDialog
                disabled={myOrder.status !== "en cours de traitement"}
                onConfirm={handleCancelOrder}
                borderColor={borderColor}
                borderRadius={borderRadius}
                paymentMethodRefund={paymentMethodRefund}
                refundPhoneNumber={refundPhoneNumber}
                refundReceiverName={refundReceiverName}
                setRefundPhoneNumber={setRefundPhoneNumber}
                setRefundReceiverName={setRefundReceiverName}
              />
            </div>
          </CardContent>
        </Card>

        {/* Résumé commande */}
        <Card
          style={{ borderColor, borderRadius }}
          className="border shadow-sm flex flex-col justify-between"
        >
          <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between font-semibold text-sm">
              <span>Articles</span>
              <Badge variant="outline" className="text-sm">
                {totalArticles.toString().padStart(2, "0")}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Montant total</span>
              <span className="text-xs">
                {returnFormatedMoney(myOrder.totalAmount)}{" "}
                <span>{currencyOrder}</span>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Promotion</span>
              <span>0 %</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Livraison</span>
              <span>
                {returnFormatedMoney(myOrder.deliveryPrice)}{" "}
                <span className="text-xs">{currencyOrder}</span>
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>
                {returnFormatedMoney(
                  myOrder.totalAmount + myOrder.deliveryPrice
                )}{" "}
                <span className="text-xs">{currencyOrder}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR CODE AND ORDER SECRET */}
      {!(
        myOrder.status === "en cours d'annulation" ||
        myOrder.status === "annulé"
      ) && (
        <section className="max-w-3xl mx-auto mb-10">
          <GenerateSecret orderId={myOrder.id} myOrder={myOrder} />
        </section>
      )}

      {(myOrder.status === "en cours d'annulation" ||
        myOrder.status === "annulé") &&
        myOrder.paymentRef && (
          <section className="max-w-3xl mx-auto mb-10">
            {/* <h3 className="text-lg font-semibold mb-6">Remboursement</h3> */}
            <Card
              style={{ borderColor, borderRadius }}
              className="border shadow-sm flex flex-col divide-y divide-gray-200"
            >
              <div className="w-full p-4 flex flex-col gap-4">
                <p>
                  Votre commande a été annulée, veuilez fournir une des
                  informations pour vous faire rembourser.
                </p>
                <CancelOrderDialogMadeByAdmin
                  disabled={false}
                  onConfirm={handleUpdateCancelOrder}
                  borderColor={borderColor}
                  borderRadius={borderRadius}
                  paymentMethodRefund={paymentMethodRefund}
                  refundPhoneNumber={refundPhoneNumber}
                  refundReceiverName={refundReceiverName}
                  setRefundPhoneNumber={setRefundPhoneNumber}
                  setRefundReceiverName={setRefundReceiverName}
                  myOrder={myOrder}
                />
              </div>
            </Card>
          </section>
        )}

      {deliveryInfo && (
        <section className="max-w-3xl mx-auto mb-10">
          <Card
            style={{ borderColor, borderRadius }}
            className="border shadow-sm flex flex-col p-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              Informations de livraison
            </h3>
            <div className="w-full  flex flex-col gap-4 capitalize">
              <p>
                Livré par <strong>{deliveryInfo.delivery}</strong>
              </p>
              <p>
                Téléphone :{" "}
                <strong>
                  {deliveryInfo.phone || deliveryInfo.phone !== "N/A"
                    ? "+(243)" + " " + deliveryInfo.phone
                    : "N/A"}
                </strong>
              </p>
            </div>
          </Card>
        </section>
      )}

      {/* Articles achetés */}
      <section className="max-w-3xl mx-auto mb-10">
        <h3 className="text-lg font-semibold mb-6">Articles achetés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {myOrder.orderItems.map(
            (item, idx) =>
              item.productImage &&
              item.productName && (
                <Link
                  key={idx}
                  href={`${shopUrl}/catalogues/${item.productId}`}
                  className="flex gap-4 items-start group"
                >
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover shadow-sm 
                   h-32 w-24
                    group-hover:brightness-90 transition"
                    priority
                  />
                  <div className="flex-1 flex flex-col capitalize">
                    <h4 className="text-lg font-semibold line-clamp-2">
                      {item.productName}
                    </h4>
                    {/* Si tu as une description ou info produit, tu peux l’ajouter ici */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.productInfo}
                    </p>
                    <div className="mt-auto flex gap-4 text-sm opacity-80">
                      <span>
                        {item.quantity.toString().padStart(2, "0")}{" "}
                        {item.quantity > 1 ? "pièces" : "pièce"}
                      </span>
                      <span>
                        {item.price * exchange}{" "}
                        <span className="text-xs">{currency}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )
          )}
        </div>
      </section>

      {/* Documents */}
      <section className="max-w-3xl mx-auto mb-10">
        <h3 className="text-lg font-semibold mb-6">Documents</h3>
        <Card
          style={{ borderColor, borderRadius }}
          className="border shadow-sm flex flex-col divide-y divide-gray-200"
        >
          <button
            type="button"
            className="flex items-center justify-between p-4 text-sm hover:bg-gray-50 transition rounded-t-md"
          >
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span>Facture</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            className="flex items-center justify-between p-4 text-sm hover:bg-gray-50 transition"
          >
            <Truck className="w-5 h-5 text-muted-foreground" />
            <span>Document sur la livraison</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            className="flex items-center justify-between p-4 text-sm hover:bg-gray-50 transition"
          >
            <Package className="w-5 h-5 text-muted-foreground" />
            <span>Document sur les produits</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            className="flex items-center justify-between p-4 text-sm hover:bg-gray-50 transition rounded-b-md"
          >
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <span>Document sur le remboursement</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </section>

      {/* contact */}
      <section className="max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-6">Contacts</h3>
        <Card
          style={{ borderColor, borderRadius }}
          className="border shadow-sm flex flex-col divide-y divide-gray-200"
        >
          <button
            type="button"
            className="flex items-center justify-between p-4 text-sm hover:bg-gray-50 transition"
          >
            <MessageCircleQuestion className="w-5 h-5 text-muted-foreground" />
            <span>Service client</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>
      </section>
    </div>
  );
};

export default MainMyOrder;

type ModifyOrderUserInfoType = {
  myOrder: OrderWithProductDetails;
  shopPreferences: Preferences;
  shop: Shop;
};

const ModifyOrderUserInfo = ({
  myOrder,
  shopPreferences,
  shop,
}: ModifyOrderUserInfoType) => {
  // Couleurs et styles personnalisés
  const borderColor = shopPreferences.buttonColor ?? "#3b82f6"; // fallback bleu
  const borderRadius = shopPreferences.buttonRadius ?? "0.5rem";

  const [receiver, setReceiver] = useState(myOrder.receiverName ?? "");
  const [receiverPhone, setReceiverPhone] = useState(myOrder.receiverTel ?? "");
  const [receiverAddress, setReceiverAddress] = useState(
    myOrder.receiverAddress ?? ""
  );

  const [description, setDescription] = useState(myOrder.description ?? "");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isDisabled = useMemo(() => {
    if (
      isEmptyString(receiver) &&
      isEmptyString(receiverPhone) &&
      isEmptyString(receiverAddress) &&
      isEmptyString(description)
    ) {
      return true;
    }

    if (
      receiver === myOrder.receiverName &&
      receiverPhone === myOrder.receiverTel &&
      receiverAddress === myOrder.receiverAddress &&
      description === myOrder.description
    ) {
      return true;
    }

    if (loading) return true; // prevent multiple submissions

    return false;
  }, [
    description,
    loading,
    myOrder.description,
    myOrder.receiverAddress,
    myOrder.receiverName,
    myOrder.receiverTel,
    receiver,
    receiverAddress,
    receiverPhone,
  ]);

  const handleModifyOrder = async () => {
    setLoading(true);
    try {
      const formData: ModifyUserInfoOrdertype = {
        receiverName: receiver,
        receiverTel: receiverPhone,
        receiverAddress: receiverAddress,
        description: description,
        orderId: myOrder.id,
        // paymentRef: myOrder.paymentRef ?? undefined,
        shopId: shop.id,
      };

      const result = await modifyUserInfoOrder(formData);
      if (result.error) {
        toast.error("Une erreur est survenue", {
          description: result.message,
        });
        return;
      }

      toast.success("Modification avec succès", {
        description: result.message,
      });

      router.refresh();
    } catch (error) {
      toast.error("Impossible d'effectuer cette action");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        asChild
        disabled={myOrder.status !== "en cours de traitement"}
      >
        <button
          className={`
            flex items-center py-2 px-4 gap-4 border shadow-sm
            bg-white text-gray-900
            transition
            hover:bg-gray-50 hover:shadow
            disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-60
            disabled:border-gray-200 disabled:cursor-not-allowed
          `}
          style={{ borderColor, borderRadius }}
        >
          <SquarePen className="shrink-0 size-5" />
          <span className="text-sm">Modifier</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            Modifier la commande
          </DialogTitle>
          <DialogDescription>
            {`Modifier le receiveur, son numero de telephone et l'addresse de livraison.`}
          </DialogDescription>
        </DialogHeader>

        {/* content */}

        <div
          className="w-full grid gap-4 p-4 "
          style={{
            borderRadius: shopPreferences.buttonRadius,
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
                color:
                  shopPreferences.background === "#ffffff"
                    ? shopPreferences.textColor
                    : "black",
                backgroundColor:
                  shopPreferences.background === "#ffffff"
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
              <span className="text-xs text-gray-500 font-normal">+(243)</span>
            </label>
            <input
              type="tel"
              id="recTel"
              name="recTel"
              placeholder="817596369"
              className="w-full border-b-2 border-gray-300 
                focus:border-blue-600 focus:outline-none py-2 
              transition-colors !bg-transparent"
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
                color:
                  shopPreferences.background === "#ffffff"
                    ? shopPreferences.textColor
                    : "black",
                backgroundColor:
                  shopPreferences.background === "#ffffff"
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
              placeholder="82 Busumelo, Kasa-Vubu, Kinshasa, RDC"
              className="w-full border-b-2 border-gray-300 
                focus:border-blue-600 focus:outline-none py-2 
              transition-colors !bg-transparent"
              defaultValue={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby="recAddressHelp"
              style={{
                color:
                  shopPreferences.background === "#ffffff"
                    ? shopPreferences.textColor
                    : "black",
                backgroundColor:
                  shopPreferences.background === "#ffffff"
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
              transition-colors resize-none h-24 !bg-transparent"
              defaultValue={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby="recDescHelp"
              style={{
                color:
                  shopPreferences.background === "#ffffff"
                    ? shopPreferences.textColor
                    : "black",
                backgroundColor:
                  shopPreferences.background === "#ffffff"
                    ? "transparent"
                    : "rgba(19, 19, 19, 0.3)",
              }}
              maxLength={400}
            />
          </div>
        </div>

        <DialogFooter
          className="flex flex-col sm:flex-row sm:justify-center 
        sm:space-x-4 space-y-3 sm:space-y-0 mt-6"
        >
          <DialogClose asChild>
            <Button
              className="w-full"
              disabled={isDisabled}
              onClick={handleModifyOrder}
            >
              {loading ? "en cours..." : "Modifier"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// cancel order
interface CancelOrderDialogProps {
  disabled: boolean;
  onConfirm: () => Promise<void> | void;
  borderColor?: string;
  borderRadius?: string;

  setRefundReceiverName: React.Dispatch<React.SetStateAction<string>>;
  setRefundPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  refundPhoneNumber: string;
  refundReceiverName: string;
  paymentMethodRefund: string;
}

export function CancelOrderDialog({
  disabled,
  onConfirm,
  borderColor,
  borderRadius,
  paymentMethodRefund,
  refundPhoneNumber,
  refundReceiverName,
  setRefundReceiverName,
  setRefundPhoneNumber,
}: CancelOrderDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={`
            flex items-center py-2 px-4 gap-4 border shadow-sm
            bg-white text-red-800
            transition
            hover:bg-gray-50 hover:shadow
            disabled:bg-gray-100 disabled:text-red-950 disabled:opacity-60
            disabled:border-gray-200 disabled:cursor-not-allowed
          `}
          style={{ borderColor, borderRadius }}
          aria-label="Annuler la commande"
        >
          <CircleX className="shrink-0 size-5" />
          <span className="text-sm">Annuler</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Confirmer l’annulation
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir annuler cette commande ? Cette action est
            irréversible.
            <br />
            Entrer le numéro de téléphone et le nom du destinataire pour le
            remboursement
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full gap-1 items-center flex-wrap">
          <span className="text-gray-500 text-sm">Methode de paiment: </span>
          <span className="font-bold capitalize">{paymentMethodRefund}</span>
        </div>

        <div className="w-full grid gap-1.5">
          <Label className="text-gray-500 text-sm">Nom du destinataire</Label>
          <Input
            type="text"
            value={refundReceiverName}
            onChange={(e) => setRefundReceiverName(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full"
            placeholder="ex: john doe"
            minLength={3}
            maxLength={60}
          />
        </div>

        <div className="w-full grid gap-1.5">
          <Label className="text-gray-500 text-sm">
            Telephone du destinataire
          </Label>
          <Input
            type="tel"
            value={refundPhoneNumber}
            onChange={(e) => setRefundPhoneNumber(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full"
            placeholder="ex: 817545966"
            minLength={9}
            maxLength={9}
          />
        </div>

        <DialogFooter className="flex gap-4 justify-end">
          {/* cancel */}
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Annuler
            </Button>
          </DialogClose>
          {/* confirm */}
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={
                loading ||
                isEmptyString(refundReceiverName) ||
                isEmptyString(refundPhoneNumber)
              }
            >
              {loading ? "Annulation..." : "Confirmer"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CancelOrderDialogMadeByAdmin({
  disabled,
  onConfirm,
  borderColor,
  borderRadius,
  paymentMethodRefund,
  refundPhoneNumber,
  refundReceiverName,
  setRefundReceiverName,
  setRefundPhoneNumber,
  myOrder,
}: CancelOrderDialogProps & { myOrder: OrderWithProductDetails }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={`
            flex items-center py-2 px-4 gap-4 border shadow-sm
            bg-white text-green-800
            transition
            hover:bg-gray-50 hover:shadow
            disabled:bg-gray-100 disabled:text-green-950 disabled:opacity-60
            disabled:border-gray-200 disabled:cursor-not-allowed
          `}
          style={{ borderColor, borderRadius }}
          aria-label="Annuler la commande"
        >
          <BanknoteArrowDown className="shrink-0 size-5" />
          <span className="text-sm">Données de remboursement</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Les donnees de remboursement
          </DialogTitle>
          <DialogDescription>
            Entrer le numéro de téléphone et le nom du destinataire pour le
            remboursement
            <br />
            <strong>
              Pour l{`'`}instant la methode de remboursement se fait uniquement
              par MPESA.
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full gap-1 items-center flex-wrap">
          <span className="text-gray-500 text-sm">Methode de paiment: </span>
          <span className="font-bold capitalize">{paymentMethodRefund}</span>
        </div>

        <div className="w-full grid gap-1.5">
          <Label className="text-gray-500 text-sm">Nom du destinataire</Label>
          <Input
            type="text"
            defaultValue={refundReceiverName}
            onChange={(e) => setRefundReceiverName(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full"
            placeholder="ex: john doe"
            minLength={3}
            maxLength={60}
          />
        </div>

        <div className="w-full grid gap-1.5">
          <Label className="text-gray-500 text-sm">
            Telephone du destinataire
          </Label>
          <Input
            type="tel"
            defaultValue={refundPhoneNumber}
            onChange={(e) => setRefundPhoneNumber(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full"
            placeholder="ex: 817545966"
            minLength={9}
            maxLength={9}
          />
        </div>

        <DialogFooter className="flex gap-4 justify-end">
          {/* cancel */}
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Annuler
            </Button>
          </DialogClose>
          {/* confirm */}
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={
                loading ||
                isEmptyString(refundReceiverName) ||
                isEmptyString(refundPhoneNumber) ||
                (refundPhoneNumber === myOrder.refundPhoneNumber &&
                  refundReceiverName === myOrder.refundReceiverName) ||
                myOrder.status !== `en cours d'annulation`
              }
            >
              {loading ? "en cours..." : "Confirmer"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// copy orderId

type CopyableOrderIdProps = {
  orderId: string;
};

function CopyableOrderId({ orderId }: CopyableOrderIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // feedback 2s
      toast.success("L'ID de commande copié dans le presse-papier");
    } catch (error) {
      console.error("Erreur de copie dans le presse-papiers", error);
      // Optionnel : afficher message erreur utilisateur
      toast.error(" Erreur de copie dans le presse-papier");
    }
  };

  return (
    <h1
      onClick={handleCopy}
      className="flex items-center gap-2 cursor-pointer select-none text-sm font-light 
      text-muted-foreground hover:text-primary transition-colors
      text-center w-fit  mx-auto
      "
      title="Cliquer pour copier l'ID de commande"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCopy();
        }
      }}
    >
      <span>Commande {orderId}</span>
      <span aria-hidden="true" className="flex shrink-0">
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </span>
    </h1>
  );
}
