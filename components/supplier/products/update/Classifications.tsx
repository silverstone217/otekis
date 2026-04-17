"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SelectorProducts,
  SelectProductCategory,
  SelectProductType,
} from "../../SelectProductCategories";
import {
  CategoriesData,
  NewAllProductsTypesWithCategory,
  StatesData,
  TargetData,
} from "@/utils/data";
import { updateClassificationsInfo } from "@/actions/supplierAction";

type Props = {
  ProductClassification: {
    state: string;
    category: string;
    type?: string | null;
    target: string | null;
    quality: string;
    productId: string;
  };
};

const Classifications = ({ ProductClassification }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    state: ProductClassification.state ?? "nouveau",
    category: ProductClassification.category ?? "",
    target: ProductClassification.target ?? "",
    type: ProductClassification.type ?? "",
    quality: ProductClassification.quality ?? "original",
  });

  const isDirty = useMemo(() => {
    const hasChanged =
      formData.type !== ProductClassification.type ||
      formData.target !== ProductClassification.target ||
      formData.quality !== ProductClassification.quality ||
      formData.category !== ProductClassification.category ||
      formData.state !== ProductClassification.state;

    const isValid =
      formData.type !== "" &&
      formData.category !== "" &&
      formData.state !== "" &&
      formData.quality !== "";

    return hasChanged && isValid;
  }, [formData, ProductClassification]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        productId: ProductClassification.productId,
      };
      const result = await updateClassificationsInfo(payload);
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
      <header className="space-y-1">
        <h2 className="text-xl font-medium tracking-tight">Classifications</h2>
        <p className="text-sm text-muted-foreground">
          Définissez la catégorie et le ciblage de votre produit.
        </p>
      </header>

      <div className="grid gap-6">
        {/* GRID 2 COLONNES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-muted-foreground">
              Catégorie
            </Label>
            <SelectProductCategory
              categories={CategoriesData}
              selectedCategory={formData.category}
              onCategoryChange={(cat) =>
                setFormData({ ...formData, category: cat, type: "" })
              }
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-muted-foreground">
              Type de produit
            </Label>
            <SelectProductType
              types={NewAllProductsTypesWithCategory}
              selectedType={formData.type}
              onTypeChange={(val) => setFormData({ ...formData, type: val })}
              category={formData.category}
              disabled
            />
          </div>
        </div>

        {/* CHAMPS RESTANTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-muted-foreground">
              État du produit
            </Label>
            <SelectorProducts
              data={StatesData}
              onChange={(val) => setFormData({ ...formData, state: val })}
              value={formData.state}
              placeholder="Sélectionnez un état"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-muted-foreground">
              Cible
            </Label>
            <SelectorProducts
              data={TargetData}
              onChange={(val) => setFormData({ ...formData, target: val })}
              value={formData.target}
              placeholder="Sélectionnez une cible"
              disabled={loading}
            />
          </div>
        </div>
      </div>

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

export default Classifications;
