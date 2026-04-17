"use client";
import { updatePrincipalInfo } from "@/actions/supplierAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isEmptyString } from "@/utils/functions";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
  ProductInfo: {
    name: string;
    description: string;
    price: number;
    brand?: string | null;
    productId: string;
  };
};

const PrincipalsInformations = ({ ProductInfo }: Props) => {
  const [name, setName] = useState(ProductInfo.name ?? "");
  const [description, setDescription] = useState(ProductInfo.description ?? "");
  const [brand, setBrand] = useState(ProductInfo.brand ?? "");
  const [price, setPrice] = useState(ProductInfo.price.toString() ?? "");

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isElementsChanged = useMemo(() => {
    if (
      name === ProductInfo.name &&
      description === ProductInfo.description &&
      price === ProductInfo.price.toString() &&
      brand === ProductInfo.brand
    ) {
      return true;
    }

    if (
      isEmptyString(name) ||
      isEmptyString(price) ||
      isEmptyString(description)
    ) {
      return true;
    }

    return false;
  }, [name, price, description, brand, ProductInfo]);

  const handelUpdatePrincipalInfo = async () => {
    setLoading(true);

    try {
      // ✅ VALIDATION
      if (name.trim().length < 2) {
        toast.error("Le nom doit contenir au moins 2 caractères");
        return;
      }

      if (description.trim().length < 5) {
        toast.error("La description doit contenir au moins 5 caractères");
        return;
      }

      if (!price || isNaN(Number(price))) {
        toast.error("Le prix doit être un nombre valide");
        return;
      }

      // 🟣 SERVER CALL
      const formData = {
        name: name.trim().toLocaleLowerCase(),
        description: description.trim(),
        brand: brand.trim(),
        price: Number(price),
        productId: ProductInfo.productId,
      };
      const result = await updatePrincipalInfo(formData);

      if (result.error) {
        toast.error(result.message);
        return;
      }

      // ✅ SUCCESS
      toast.success("Informations mises à jour");

      router.refresh();
    } catch (error) {
      console.error("error on update principal info", error);
      toast.error("Oops ! Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* HEADER */}
      <div className="">
        <h2 className="text-lg font-semibold">Informations principales</h2>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations essentielles du produit
        </p>
      </div>

      {/* FORM CARD */}
      <div
        className="
        space-y-6
        p-5
        rounded-2xl
        border
        bg-background
        shadow-sm
        "
      >
        {/* NAME */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nom du produit *</label>
          <Input
            placeholder="Ex: T-shirt Otekis"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>

        {/* BRAND */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Marque</label>
          <Input
            placeholder="Ex: Nike, Apple..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description *</label>
          <Textarea
            placeholder="Ex: Un t-shirt 100% coton bio..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="min-h-[140px]"
          />
        </div>

        {/* PRICE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Prix ($) *</label>
          <Input
            type="number"
            placeholder="Ex: 29.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>

        {/* ACTION */}
        <div className="pt-2">
          <Button
            onClick={handelUpdatePrincipalInfo}
            disabled={loading || isElementsChanged}
            className="
          w-full h-11
          text-sm font-medium
        "
          >
            {loading ? "Mise à jour..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrincipalsInformations;
