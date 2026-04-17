"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { updatePrincipalInfo } from "@/actions/supplierAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: ProductInfo.name ?? "",
    description: ProductInfo.description ?? "",
    brand: ProductInfo.brand ?? "",
    price: ProductInfo.price?.toString() ?? "",
  });

  // Détection propre des changements et de la validité
  const isDirty = useMemo(() => {
    const hasChanged =
      formData.name !== ProductInfo.name ||
      formData.description !== ProductInfo.description ||
      formData.brand !== (ProductInfo.brand ?? "") ||
      formData.price !== ProductInfo.price.toString();

    const isValid =
      formData.name.trim().length >= 2 &&
      formData.description.trim().length >= 5 &&
      formData.price !== "" &&
      !isNaN(Number(formData.price));

    return hasChanged && isValid;
  }, [formData, ProductInfo]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        price: Number(formData.price),
        productId: ProductInfo.productId,
      };

      const result = await updatePrincipalInfo(payload);

      if (result.error) throw new Error(result.message);

      toast.success("Modifications enregistrées");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-4">
      {/* HEADER DISCRET */}
      <header className="space-y-1">
        <h2 className="text-xl font-medium tracking-tight">Général</h2>
        <p className="text-sm text-muted-foreground">
          Gérez les détails publics de votre produit.
        </p>
      </header>

      {/* FORMULAIRE SANS CADRE LOURD */}
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[13px] font-medium text-muted-foreground"
            >
              Nom du produit
            </Label>
            <Input
              id="name"
              placeholder="Nom du produit"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-transparent border-muted/60 focus:border-primary transition-all duration-200"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="brand"
              className="text-[13px] font-medium text-muted-foreground"
            >
              Marque (Optionnel)
            </Label>
            <Input
              id="brand"
              placeholder="Marque"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="bg-transparent border-muted/60 focus:border-primary transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-[13px] font-medium text-muted-foreground"
          >
            Description détaillée
          </Label>
          <Textarea
            id="description"
            placeholder="Dites-en plus sur votre produit..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="min-h-[120px] bg-transparent border-muted/60 focus:border-primary resize-none transition-all duration-200"
            disabled={loading}
          />
        </div>

        <div className="max-w-[200px] space-y-2">
          <Label
            htmlFor="price"
            className="text-[13px] font-medium text-muted-foreground"
          >
            Prix (USD)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="pl-7 bg-transparent border-muted/60 focus:border-primary transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>

        {/* BARRE D'ACTION MINIMALISTE */}
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
    </div>
  );
};

export default PrincipalsInformations;
