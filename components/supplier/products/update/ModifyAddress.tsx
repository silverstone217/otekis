"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectorProducts } from "../../SelectProductCategories";
import { communesKinshasa, communesQuartiers } from "@/utils/zones";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { upadteAddressProduct } from "@/actions/supplierAction";

type AddressType = {
  productId: string;
  address: string;
  contactNumber: string;
  paymentNumber: string;
  deliveryPrice: number;
  isDelivering: boolean;
};

const ModifyAddress = ({ address, productId, ...rest }: AddressType) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ SAFE SPLIT
  const parts = address?.split(",") ?? [];

  const initial = {
    commune: parts[0]?.trim() ?? "",
    quartier: parts[1]?.trim() ?? "",
    avenue: parts.slice(2).join(",").trim(),
  };

  const [contactNumber, setContactNumber] = useState(rest.contactNumber ?? "");
  const [paymentNumber, setPaymentNumber] = useState(rest.paymentNumber ?? "");
  const [deliveryPrice, setDeliveryPrice] = useState(
    rest.deliveryPrice?.toString() ?? "",
  );
  const [isDelivering, setIsDelivering] = useState(rest.isDelivering ?? false);

  const [formData, setFormData] = useState(initial);

  const isValidNumber = (val: string) => /^\d{9}$/.test(val);
  // ✅ DETECT CHANGES + VALID
  const isDirty = useMemo(() => {
    const hasChanged =
      formData.commune !== initial.commune ||
      formData.quartier !== initial.quartier ||
      formData.avenue !== initial.avenue ||
      contactNumber !== rest.contactNumber ||
      paymentNumber !== rest.paymentNumber ||
      deliveryPrice !== rest.deliveryPrice?.toString() ||
      isDelivering !== rest.isDelivering;

    const isValid =
      formData.commune &&
      formData.quartier &&
      /^.+,\s*\d+[a-zA-Z]?$/.test(formData.avenue) &&
      isValidNumber(contactNumber) &&
      isValidNumber(paymentNumber) &&
      !isNaN(Number(deliveryPrice)) &&
      Number(deliveryPrice) >= 0 &&
      (isDelivering ? Number(deliveryPrice) > 0 : true);

    return hasChanged && isValid;
  }, [
    formData,
    contactNumber,
    paymentNumber,
    initial,
    rest.contactNumber,
    rest.paymentNumber,
    rest.deliveryPrice,
    rest.isDelivering,
  ]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (!formData.commune) {
        toast.error("Veuillez sélectionner une commune");
        return;
      }

      if (!formData.quartier) {
        toast.error("Veuillez sélectionner un quartier");
        return;
      }

      if (!/^.+,\s*\d+[a-zA-Z]?$/.test(formData.avenue)) {
        toast.error("Format invalide (ex: Samba, 12 ou Samba, 12C)");
        return;
      }

      if (!isValidNumber(contactNumber)) {
        toast.error("Le numéro WhatsApp doit contenir exactement 9 chiffres");
        return;
      }

      if (!isValidNumber(paymentNumber)) {
        toast.error(
          "Le numéro de paiement doit contenir exactement 9 chiffres",
        );
        return;
      }
      if (isNaN(Number(deliveryPrice)) || Number(deliveryPrice) < 0) {
        toast.error("Le prix de livraison doit être un nombre positif");
        return;
      }

      const payload = {
        address: `${formData.commune}, ${formData.quartier}, ${formData.avenue}`,
        productId,
        contactNumber,
        paymentNumber,
        deliveryPrice: parseFloat(deliveryPrice),
        isDelivering,
      };

      const result = await upadteAddressProduct(payload);

      if (result.error) throw new Error(result.message);

      toast.success(result.message);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-4">
      {/* HEADER (aligné avec Classification) */}
      <header className="space-y-1">
        <h2 className="text-xl font-medium tracking-tight">
          Localisation du produit et Contacts
        </h2>
        <p className="text-sm text-muted-foreground">
          Définissez précisément où se trouve le produit.
        </p>
      </header>

      {/* FORM */}
      <div className="grid gap-6">
        {/* GRID 2 COLONNES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* COMMUNE */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-muted-foreground">
              Commune
            </label>
            <SelectorProducts
              data={communesKinshasa.map((c) => ({
                label: c,
                value: c.toLowerCase(),
              }))}
              value={formData.commune}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  commune: val as string,
                  quartier: "",
                })
              }
              placeholder="Sélectionnez une commune"
              disabled={loading}
            />
          </div>

          {/* QUARTIER */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-muted-foreground">
              Quartier
            </label>
            <SelectorProducts
              data={communesQuartiers
                .filter(
                  (cq) =>
                    cq.name.toLowerCase() === formData.commune.toLowerCase(),
                )
                .flatMap((cq) => cq.quartiers)
                .map((q) => ({
                  label: q,
                  value: q.toLowerCase(),
                }))}
              value={formData.quartier}
              onChange={(val) => setFormData({ ...formData, quartier: val })}
              placeholder="Sélectionnez un quartier"
              disabled={!formData.commune || loading}
            />
          </div>
        </div>

        {/* AVENUE */}
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-muted-foreground">
            Avenue et numéro
          </label>
          <Input
            value={formData.avenue}
            onChange={(e) =>
              setFormData({ ...formData, avenue: e.target.value })
            }
            placeholder="Ex: Busu-Melo, 12"
            disabled={loading}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Format : Nom de l’avenue, numéro (ex: Samba, 12)
          </p>
        </div>

        {/* DELIVERY OPTIONS */}
        <div className={`grid w-full grid-cols-1 sm:grid-cols-2 gap-4`}>
          {/* LIVRAISON */}
          <div className="grid w-full items-center gap-2 col-span-1">
            <label htmlFor="isDelivering" className="text-sm font-medium">
              Proposez-vous la livraison ?
            </label>

            <SelectorProducts
              data={[
                { label: "Oui", value: "yes" },
                { label: "Non", value: "no" },
              ]}
              onChange={(val) => {
                setIsDelivering(val === "yes");
                if (val !== "yes") {
                  setDeliveryPrice("");
                }
              }}
              value={isDelivering ? "yes" : "no"}
              placeholder="Sélectionnez une option"
              disabled={loading}
            />
          </div>

          {/* DELIVERY PRICE */}
          {isDelivering && (
            <div className="grid w-full items-center gap-2 col-span-1">
              <label htmlFor="deliveryPrice" className="text-sm font-medium">
                Prix de livraison ($)*
              </label>
              <Input
                id="deliveryPrice"
                type="number"
                placeholder="Ex: 3.5"
                required
                min="0"
                step="0.1"
                value={deliveryPrice}
                onChange={(e) => setDeliveryPrice(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* CONTACTS */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CONTACT NUMBER */}
          <div className="grid w-full items-center gap-2">
            <label htmlFor="contactNumber" className="text-sm font-medium">
              Numero de telephone (Whatsapp) *
            </label>

            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2
                  text-sm text-foreground
                  pointer-events-none"
              >
                +243
              </span>

              <Input
                id="contactNumber"
                type="tel"
                placeholder="83222622"
                required
                minLength={9}
                maxLength={9}
                value={contactNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setContactNumber(val);
                }}
                className="pl-12 text-sm"
              />
            </div>
          </div>

          {/* CONTACT PAYMENT */}
          <div className="grid w-full items-center gap-2">
            <label htmlFor="paymentNumber" className="text-sm font-medium">
              Numero de paiement (MPESA, AIRTEL MONEY...)*
            </label>

            <div className="relative">
              <span
                className="
                  absolute left-3 top-1/2 -translate-y-1/2
                  text-sm text-foreground
                  pointer-events-none
                "
              >
                +243
              </span>

              <Input
                id="paymentNumber"
                type="tel"
                placeholder="832222622"
                required
                minLength={9}
                maxLength={9}
                value={paymentNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPaymentNumber(val);
                }}
                className="pl-12 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION (identique classification) */}
      <div className="flex items-center justify-end pt-4 border-t border-muted/40">
        <Button
          onClick={handleUpdate}
          disabled={!isDirty || loading}
          className="px-8 h-10 transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default ModifyAddress;
