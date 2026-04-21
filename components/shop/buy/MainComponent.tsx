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

import { capitalizeText } from "@/utils/shopFunctions";
import { Loader2, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { SelectorProducts } from "@/components/supplier/SelectProductCategories";
import { cn } from "@/lib/utils";

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

  // PRICE
  //   const finalPrice = product.price + beneficeAfterDiscount;
  const total = useMemo(
    () => totalPriceAfterDiscount * quantity * companyPrefs.exchange,
    [quantity, totalPriceAfterDiscount],
  );

  const stock = useMemo(
    () => product.Article.reduce((acc, item) => acc + item.stock, 0),
    [product.Article],
  );

  // SUBMIT
  const handleSubmit = async () => {
    if (!receiverName || !receiverTel || !commune || !quartier || !avenue) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (!selectedArticle) {
      toast.error("Veuillez sélectionner une variante");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        productId: product.id,
        articleId: selectedArticle.id,
        quantity,
        receiverName,
        receiverTel,
        address: `${commune}, ${quartier}, ${avenue}`,
      };

      console.log("ORDER:", payload);

      toast.success("Commande envoyée !");
      router.refresh();
    } catch (e: any) {
      toast.error("Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  //
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

  const isDisabled = !!formError;

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

      {/* PRODUCT CARD */}
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

        <div className="flex flex-col flex-1">
          <h3 className="font-semibold line-clamp-2">
            {capitalizeText(product.name)}
          </h3>

          <p className="text-sm opacity-70 line-clamp-2">
            {capitalizeText(product.description)}
          </p>

          <div className="mt-2 font-bold text-lg">
            {total.toLocaleString()} {companyPrefs.currency}
          </div>
        </div>
      </div>

      {/* ARTICLE SELECT */}
      <div className="space-y-3">
        <Label>Choisir une variante</Label>

        <RadioGroup
          value={selectedArticleId}
          onValueChange={(val) => {
            setSelectedArticleId(val);
            setQuantity(1);
          }}
        >
          {product.Article.map((item) => {
            const isSelected = selectedArticleId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  isSelected && "ring-2",
                )}
                style={{
                  borderColor: isSelected ? preferences.buttonColor : undefined,
                  backgroundColor: isSelected
                    ? `${preferences.buttonColor}10`
                    : undefined, // léger fond
                }}
              >
                <div className="flex items-center gap-3">
                  {/* RADIO CUSTOM */}
                  <RadioGroupItem
                    value={item.id}
                    className="
              relative h-4 w-4 rounded-full border
              data-[state=checked]:border-transparent
            "
                    style={{
                      borderColor: preferences.buttonColor,
                      backgroundColor: isSelected
                        ? preferences.buttonColor
                        : "transparent",
                    }}
                  />

                  {/* LABEL */}
                  <span>
                    {item.color
                      ? capitalizeText(returnDataValue(item.color, ColorsData))
                      : "Autres"}
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

      {/* QUANTITY */}
      <div className="space-y-2">
        <Label>Quantité</Label>
        <Input
          type="number"
          min={1}
          max={selectedArticle?.stock || 1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      {/* FORM */}
      <div className="space-y-4">
        <Label>Informations du receveur</Label>

        <div className="space-y-2">
          <Input
            placeholder="Nom complet"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
          />
        </div>

        {/* PHONES */}
        {/* PHONES */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CONTACT */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Numéro du receveur (WhatsApp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  +243
                </span>
                <Input
                  className="pl-14"
                  placeholder="Ex: 832226622"
                  value={receiverTel}
                  onChange={(e) =>
                    setReceiverTel(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={9}
                />
              </div>
            </div>

            {/* PAYMENT */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Numéro de paiement mobile
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  +243
                </span>
                <Input
                  className="pl-14"
                  placeholder="Mpesa / Airtel Money"
                  value={paymentNumber}
                  onChange={(e) =>
                    setPaymentNumber(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* HELPER TEXT */}
          <p className="text-xs text-muted-foreground">
            Le premier numéro sera utilisé pour contacter le receveur. Le second
            servira pour effectuer le paiement mobile.
          </p>
        </div>

        {/* ADDRESS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* COMMUNE */}
          <div>
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
          </div>

          {/* QUARTIER */}
          <div>
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
              disabled={!commune}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Avenue, numéro"
            value={avenue}
            onChange={(e) => setAvenue(e.target.value)}
          />
          {/* HELPER TEXT */}
          <p className="text-xs text-muted-foreground">ex: Busu-melo, 14</p>
        </div>
      </div>

      {/* CTA */}
      <Button
        disabled={isDisabled || loading}
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
    </div>
  );
};

export default MainComponent;
