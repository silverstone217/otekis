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
};

const ModifyAddress = ({ address, productId }: AddressType) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ SAFE SPLIT
  const parts = address?.split(",") ?? [];

  const initial = {
    commune: parts[0]?.trim() ?? "",
    quartier: parts[1]?.trim() ?? "",
    avenue: parts.slice(2).join(",").trim(),
  };

  const [formData, setFormData] = useState(initial);

  // ✅ DETECT CHANGES + VALID
  const isDirty = useMemo(() => {
    const hasChanged =
      formData.commune !== initial.commune ||
      formData.quartier !== initial.quartier ||
      formData.avenue !== initial.avenue;

    const isValid =
      formData.commune &&
      formData.quartier &&
      /^.+,\s*\d+[a-zA-Z]?$/.test(formData.avenue);

    return hasChanged && isValid;
  }, [formData, initial]);

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

      const payload = {
        address: `${formData.commune}, ${formData.quartier}, ${formData.avenue}`,
        productId,
      };

      const result = await upadteAddressProduct(payload);

      if (result.error) throw new Error(result.message);

      toast.success("Adresse mise à jour");
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
          Localisation du produit
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
