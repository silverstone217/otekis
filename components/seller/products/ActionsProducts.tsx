"use client";
import {
  addTypeProducts,
  deleteAllProds,
  setSamePercentage,
} from "@/actions/shopActions";
import { Shop } from "@/lib/generated/prisma/client";
import { CircleDollarSign, Podcast, Trash, Plus, Minus } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button"; // <- shadcn
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AddProductType } from "@/types/data";
import { toast } from "sonner";

type Props = { shop: Shop };

const ActionsProducts = ({ shop }: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const deleteAllProducts = async () => {
    setLoading(true);
    try {
      const delProds = await deleteAllProds({ shopId: shop.id });
      if (delProds.error) {
        toast.error("Erreur survenue", { description: delProds.message });
        return;
      }
      toast.success(delProds.message);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur survenue", {
        description: "Impossible d'effectuer cette action pour le moment!",
      });
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row gap-3 w-full mt-4",
        "items-stretch md:items-center justify-center md:justify-start",
        "transition-all duration-300"
      )}
    >
      <SetAutoOrSelfAddProducts
        shop={shop}
        loading={loading}
        setLoading={setLoading}
      />
      <SetPercentForAllProducts
        shop={shop}
        loading={loading}
        setLoading={setLoading}
      />
      <ConfirmDeleteAllProducts loading={loading} action={deleteAllProducts} />
    </div>
  );
};

export default ActionsProducts;

// ========== DELETE ALL ===========
type ActionsProps = { loading: boolean; action: () => void };
const ConfirmDeleteAllProducts = ({ loading, action }: ActionsProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="destructive"
        className={cn(
          "flex gap-2 items-center font-semibold shadow-sm px-6 rounded-xl bg-gradient-to-r from-rose-600 to-red-500",
          "transition-all duration-200"
        )}
        disabled={loading}
      >
        <Trash className="w-5 h-5" />
        <span>Tout retirer</span>
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="max-w-[94vw] w-[380px] rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle>Tout supprimer ?</AlertDialogTitle>
        <AlertDialogDescription>
          Cette action supprimera <b>tous les produits</b> de cette boutique.
          <br />
          <span className="text-rose-600 font-bold">Action irréversible.</span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
        <AlertDialogAction
          disabled={loading}
          onClick={action}
          className="bg-destructive text-white rounded-lg shadow"
        >
          Confirmer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// ========== FIX PERCENT ===========
type ActionFixPerProps = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  shop: Shop;
};
const SetPercentForAllProducts = ({
  loading,
  shop,
  setLoading,
}: ActionFixPerProps) => {
  const router = useRouter();
  const [percentage, setPercentage] = useState(shop.percentage ?? 5);

  const setPercentAllProducts = async () => {
    setLoading(true);
    try {
      const result = await setSamePercentage({ shopId: shop.id, percentage });
      if (result.error) {
        toast.error("Erreur survenue", { description: result.message });
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur survenue", {
        description: "Impossible d'effectuer cette action pour le moment!",
      });
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-5 bg-gradient-to-r from-emerald-600 to-emerald-400",
            "hover:from-emerald-700 hover:to-emerald-600 font-semibold rounded-xl shadow"
          )}
        >
          <CircleDollarSign className="w-5 h-5" />
          <span>Pourcentage par défaut</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[94vw] w-[380px] rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Définir un pourcentage</AlertDialogTitle>
          <AlertDialogDescription>
            Affecter un même pourcentage à tous les produits de cette boutique.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Card className="my-3 border-none shadow-none bg-transparent p-0">
          <CardContent className="flex items-center justify-between px-0 py-2">
            <Label className="text-muted-foreground">Pourcentage</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Réduire"
                className="rounded-full h-9 w-9"
                onClick={() => setPercentage((p) => Math.max(0, p - 5))}
                disabled={percentage === 0 || loading}
              >
                <Minus />
              </Button>
              <span className="text-lg font-bold tabular-nums">
                {percentage}%
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Augmenter"
                className="rounded-full h-9 w-9"
                onClick={() => setPercentage((p) => Math.min(400, p + 5))}
                disabled={percentage === 400 || loading}
              >
                <Plus />
              </Button>
            </div>
          </CardContent>
        </Card>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || shop.percentage === percentage}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => !loading && setPercentAllProducts()}
          >
            Définir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ========== AUTO/SELF ADD ===========
const SetAutoOrSelfAddProducts = ({
  loading,
  shop,
  setLoading,
}: ActionFixPerProps) => {
  const router = useRouter();
  const [percentage, setPercentage] = useState(shop.percentage ?? 5);
  const [addType, setAddType] = useState<"self" | "auto">(
    (shop.ajout ?? "self") as "self" | "auto"
  );

  const setAddTypeAndPercentAllProducts = async () => {
    setLoading(true);
    try {
      const result = await addTypeProducts({
        shopId: shop.id,
        percentage,
        addType,
      });
      if (result.error) {
        toast.error("Erreur survenue", { description: result.message });
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur survenue", {
        description: "Impossible d'effectuer cette action pour le moment!",
      });
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  const isButtonDisabled = useMemo(() => {
    if (loading) return true;
    if (
      shop.percentage === percentage &&
      addType === "auto" &&
      shop.ajout === "auto"
    )
      return true;
    if (shop.ajout === "self" && addType === "self") return true;
    return false;
  }, [loading, shop, percentage, addType]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={loading}
          className={cn(
            "flex items-center gap-2 min-w-[180px]",
            "bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold shadow rounded-xl",
            "hover:from-blue-800 hover:to-cyan-600"
          )}
        >
          <Podcast className="w-5 h-5" />
          <span>
            {shop.ajout === "self" ? "Ajout manuel" : "Ajout automatique"}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[94vw] w-[400px] rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{`Type d'ajout des produits`}</AlertDialogTitle>
          <AlertDialogDescription>
            {`Choisissez le mode d'ajout des produits dans la boutique.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-6 py-2 mt-2">
          {/* Radios */}
          <RadioGroup
            defaultValue={addType}
            onValueChange={(val) => setAddType(val as AddProductType)}
            className="flex gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="self" id="self" />
              <Label htmlFor="self">Ajout manuel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto">Ajout automatique</Label>
            </div>
          </RadioGroup>
          {/* Percentage selector */}
          {addType === "auto" && (
            <div className="flex items-center justify-between gap-1">
              <Label className="text-muted-foreground">Pourcentage</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Réduire"
                  className="rounded-full h-9 w-9"
                  onClick={() => setPercentage((p) => Math.max(0, p - 5))}
                  disabled={percentage === 0 || loading}
                >
                  <Minus />
                </Button>
                <span className="text-lg font-bold tabular-nums">
                  {percentage}%
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Augmenter"
                  className="rounded-full h-9 w-9"
                  onClick={() => setPercentage((p) => Math.min(400, p + 5))}
                  disabled={percentage === 400 || loading}
                >
                  <Plus />
                </Button>
              </div>
            </div>
          )}
          {/* Note */}
          <Card className="bg-muted/30 border-none rounded-lg p-3">
            <CardContent className="p-0 text-sm text-muted-foreground">
              <b>Ajout manuel :</b> sélectionnez et ajoutez chaque produit un à
              un.
              <br />
              <b>Ajout automatique :</b> tous les produits de la catégorie de
              votre boutique sont ajoutés dynamiquement (en appliquant le
              pourcentage choisi).
              <br />
              <span className="text-xs text-rose-700 font-semibold">
                Choisir automatique ajustera le pourcentage pour tous les
                produits déjà existants .
              </span>
            </CardContent>
          </Card>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isButtonDisabled}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => !loading && setAddTypeAndPercentAllProducts()}
          >
            Définir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
