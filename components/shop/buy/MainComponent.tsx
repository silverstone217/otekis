"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Preferences,
  Shop,
  SupplierArticle,
  SupplierProduct,
  SupplierProductShop,
} from "@/lib/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { communesKinshasa, communesQuartiers } from "@/utils/zones";

import { ColorsData } from "@/utils/dataAdd";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnDataValue,
} from "@/utils/functions";

import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import { Loader2, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { SelectorProducts } from "@/components/supplier/SelectProductCategories";
import { cn } from "@/lib/utils";
import {
  canThisOrderBeProccessed,
  createSupplierOrder,
  CreateSupplierOrderType,
} from "@/actions/supplierOrderAction";
import { SuccessOrderModal } from "./SuccessOrderModal";

type Props = {
  shop: Shop;
  product: SupplierProduct & {
    Article: SupplierArticle[];
  };
  preferences: Preferences;
  companyPrefs: {
    currency: "USD" | "CDF";
    exchange: number;
  };
  supplierProductShops: SupplierProductShop;
};

const MainComponent = ({
  preferences,
  companyPrefs,
  product,
  shop,
  supplierProductShops: productShop,
}: Props) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ARTICLE
  const [selectedArticleId, setSelectedArticleId] = useState(
    product.Article[0]?.id,
  );

  const selectedArticle = product.Article.find(
    (a) => a.id === selectedArticleId,
  );

  const [quantity, setQuantity] = useState(1);

  // FORM
  const [receiverName, setReceiverName] = useState("");
  const [receiverTel, setReceiverTel] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [commune, setCommune] = useState("");
  const [quartier, setQuartier] = useState("");
  const [avenue, setAvenue] = useState("");

  // SUCCESS
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  // benefit
  const benefit = productShop ? productShop.price! - (product.price ?? 0) : 0;

  const beneficeAfterDiscount = applyPromotionOnProfit(
    benefit!,
    productShop.promotion!,
  );

  const totalPriceAfterDiscount = product.price + beneficeAfterDiscount; // finalPrice

  const discountPercentage = calculateDiscountPercentage(
    productShop.price!,
    totalPriceAfterDiscount,
  );

  const deliveryPrice = product.deliveryPrice ?? 0;

  // PRICE
  //   const finalPrice = product.price + beneficeAfterDiscount;
  // const total = useMemo(
  //   () => totalPriceAfterDiscount * quantity * companyPrefs.exchange,
  //   [quantity, totalPriceAfterDiscount],
  // );

  const total = useMemo(
    () => productShop.price * quantity * companyPrefs.exchange,
    [quantity, productShop],
  );

  const stock = useMemo(
    () => product.Article.reduce((acc, item) => acc + item.stock, 0),
    [product.Article],
  );

  // VALIDATE FORM
  const validateOrderForm = ({
    receiverName,
    receiverTel,
    paymentNumber,
    commune,
    quartier,
    avenue,
  }: {
    receiverName: string;
    receiverTel: string;
    paymentNumber: string;
    commune: string;
    quartier: string;
    avenue: string;
  }) => {
    // trim pour éviter les espaces vides
    if (!receiverName.trim()) return "Veuillez renseigner le nom du receveur";

    if (!/^\d{9}$/.test(receiverTel))
      return "Numéro du receveur invalide (9 chiffres requis)";

    if (!/^\d{9}$/.test(paymentNumber))
      return "Numéro de paiement invalide (9 chiffres requis)";

    if (!commune.trim()) return "Veuillez sélectionner une commune";

    if (!quartier.trim()) return "Veuillez sélectionner un quartier";

    if (!/^.+,\s*\d+[a-zA-Z]?$/.test(avenue))
      return "Adresse invalide (ex: Samba, 12)";

    return null; // ✅ tout est OK
  };

  // FORM
  const formError = useMemo(() => {
    return validateOrderForm({
      receiverName,
      receiverTel,
      paymentNumber,
      commune,
      quartier,
      avenue,
    });
  }, [receiverName, receiverTel, paymentNumber, commune, quartier, avenue]);

  // SUBMIT
  const handleSubmit = async () => {
    if (formError) {
      toast.error(formError);
      return;
    }

    if (!selectedArticle) {
      toast.error("Sélectionnez une variante");
      return;
    }

    setLoading(true);

    try {
      toast.info(
        "Vous avez 30 secondes pour valider le paiement sur votre mobile.",
      );

      setTimeout(() => {
        toast.info("Valider le paiement sur votre telephone.");
      }, 1000);

      const payload: CreateSupplierOrderType = {
        productId: product.id,
        articleId: selectedArticle.id,
        quantity,
        receiver: {
          name: receiverName,
          number: receiverTel,
          address: `${commune}, ${quartier}, ${avenue}`,
        },
        productShopId: productShop.id,
        paymentNumber,
        deliveryId: "",

        amount: total,
      };

      const result = await createSupplierOrder(payload);

      if (result.error || !result.data) {
        toast.error(result.message || "Commande invalide");
        setLoading(false);
        return;
      }

      // console.log("ORDER:", payload);
      toast.success(
        "Votre paiement a été effectué avec succès, en attente de validation de la commande",
      );

      // RESET FORM
      setPaymentNumber("");
      setAvenue("");
      setCommune("");
      setQuartier("");
      setReceiverName("");
      setReceiverTel("");
      setSelectedArticleId(product.Article[0]?.id ?? "");
      setQuantity(1);

      router.refresh();

      // ACTION SUCCESS
      setCreatedOrderId(result.data.id);
      setShowSuccess(true);
    } catch {
      toast.error("Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  // LUMINANCE
  const luminance = luminanceColor(preferences.background);

  // couleurs dynamiques
  const isLightBg = luminance === "light";

  if (!product.Article.length) return null;

  return (
    <div
      className="max-w-2xl mx-auto py-10 px-4 space-y-8"
      style={{
        color: preferences.textColor,
        fontFamily: preferences.fontFamily,
      }}
    >
      {/* HEADER */}
      <h2 className="text-2xl font-semibold text-center">
        Finaliser votre achat
      </h2>

      {/* PRODUCT */}
      <div
        className="flex gap-4 p-4 rounded-xl border"
        style={{
          background: preferences.background,
          borderRadius: preferences.buttonRadius,
        }}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={120}
          height={120}
          className="rounded-lg object-cover"
        />
        <div>
          <h3 className="font-semibold">{capitalizeText(product.name)}</h3>
          <p className="text-sm opacity-70 line-clamp-2">
            {capitalizeText(product.description)}
          </p>
          <div className="mt-2 font-bold">
            {total.toLocaleString()} {companyPrefs.currency}
          </div>
        </div>
      </div>

      {/* 1. VARIANTE */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">1. Variante</h3>

        <RadioGroup
          value={selectedArticleId}
          onValueChange={(val) => {
            setSelectedArticleId(val);
            setQuantity(1);
          }}
        >
          {product.Article.map((item) => {
            const isSelected = item.id === selectedArticleId;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg transition-all",
                  isSelected && "ring-2",
                )}
                style={{
                  borderColor: isSelected ? preferences.buttonColor : undefined,
                  backgroundColor: isSelected
                    ? `${preferences.buttonColor}10`
                    : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* RADIO CUSTOM */}
                  <div className="relative flex items-center justify-center">
                    <RadioGroupItem
                      value={item.id}
                      className="h-4 w-4 border"
                      style={{
                        borderColor: preferences.buttonColor,
                      }}
                    />

                    {/* DOT INTERNE */}
                    {isSelected && (
                      <span
                        className="absolute h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: preferences.buttonColor,
                        }}
                      />
                    )}
                  </div>

                  {/* LABEL */}
                  <span>
                    {item.color
                      ? capitalizeText(returnDataValue(item.color, ColorsData))
                      : "Unique"}
                  </span>

                  {item.size && <span>{item.size}</span>}
                </div>

                {/* STOCK */}
                <span className="text-xs opacity-70">{item.stock} dispo</span>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* 2. QUANTITÉ */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">2. Quantité</h3>

        {/* OUT OF STOCK */}
        {(selectedArticle?.stock ?? 0) < 1 ? (
          <div
            className="text-sm text-red-500 bg-red-500/10 
          border border-red-500/20 rounded-lg p-3"
          >
            Produit indisponible pour le moment
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* DECREMENT */}
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-md border transition",
                quantity <= 1
                  ? "opacity-40 cursor-not-allowed"
                  : isLightBg
                    ? "hover:bg-muted-foreground"
                    : "hover:bg-muted",
              )}
            >
              −
            </button>

            {/* VALUE */}
            <div
              className="min-w-[60px] text-center text-base font-medium"
              style={{
                color: preferences.textColor,
              }}
            >
              {quantity}
            </div>

            {/* INCREMENT */}
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.min(selectedArticle!.stock, q + 1))
              }
              disabled={quantity >= selectedArticle!.stock}
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-md border transition",
                quantity >= selectedArticle!.stock
                  ? "opacity-40 cursor-not-allowed"
                  : isLightBg
                    ? "hover:bg-muted-foreground"
                    : "hover:bg-muted",
              )}
            >
              +
            </button>

            {/* STOCK INFO */}
            <span className="text-xs text-muted-foreground ml-2">
              {selectedArticle?.stock} disponible
            </span>
          </div>
        )}
      </div>

      {/* 3. RECEVEUR */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <User className="w-4 h-4" />
          3. Receveur
        </h3>

        <Input
          placeholder="Nom complet"
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
          disabled={loading}
        />

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">+243</span>
          <Input
            className="pl-14"
            placeholder="Numéro WhatsApp"
            value={receiverTel}
            onChange={(e) => setReceiverTel(e.target.value.replace(/\D/g, ""))}
            maxLength={9}
            disabled={loading}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Numero du receveur de prference Whatsapp. Numero à 9 chiffres sans le
          0
        </p>
      </div>

      {/* 4. ADRESSE */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="w-4 h-4" />
          4. Adresse
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <SelectorProducts
            data={communesKinshasa.map((c) => ({
              label: c,
              value: c.toLowerCase(),
            }))}
            onChange={(val) => {
              setCommune(val as string);
              setQuartier("");
            }}
            value={commune}
            placeholder="Commune"
          />

          <SelectorProducts
            data={communesQuartiers
              .filter((cq) => cq.name.toLowerCase() === commune.toLowerCase())
              .flatMap((cq) => cq.quartiers)
              .map((q) => ({
                label: q,
                value: q.toLowerCase(),
              }))}
            onChange={setQuartier}
            value={quartier}
            placeholder="Quartier"
            disabled={!commune || loading}
          />
        </div>

        <Input
          placeholder="Avenue, numéro"
          value={avenue}
          onChange={(e) => setAvenue(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Avenue, numero ex: Busu-melo, 14
        </p>
      </div>

      {/* 5. PAIEMENT */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Phone className="w-4 h-4" />
          5. Paiement
        </h3>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">+243</span>
          <Input
            className="pl-14"
            placeholder="Numéro Mobile Money"
            value={paymentNumber}
            onChange={(e) =>
              setPaymentNumber(e.target.value.replace(/\D/g, ""))
            }
            maxLength={9}
            disabled={loading}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Ce numéro sera utilisé pour effectuer le paiement mobile. Numero à 9
          chiffres sans le 0
        </p>
      </div>

      {/* CTA */}
      <Button
        disabled={!!formError || loading}
        onClick={handleSubmit}
        className="w-full h-12"
        style={{
          background: preferences.buttonColor,
          color: preferences.buttonTextColor,
          borderRadius: preferences.buttonRadius,
        }}
      >
        {loading ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          `Payer ${total.toLocaleString()} ${companyPrefs.currency}`
        )}
      </Button>

      {/* SUCCESS MODAL */}
      <SuccessOrderModal
        isOpen={showSuccess}
        orderId={createdOrderId}
        shopSlug={shop.slug}
        preferences={preferences}
        openChange={(open) => setShowSuccess(open)}
      />
    </div>
  );
};

export default MainComponent;
