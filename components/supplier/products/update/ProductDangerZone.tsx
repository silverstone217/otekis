"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

import { deleteProductById } from "@/actions/supplierAction";

type Props = {
  productId: string;
  productName: string;
  images: string[];
};

const ProductDangerZone = ({ productId, productName, images }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const result = await deleteProductById({ productId });

      if (result.error) {
        throw new Error(result.message);
      }

      toast.success("Produit supprimé avec succès");
      router.refresh();
      router.replace("/fournisseurs");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto sm:col-span-2 space-y-6">
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Zone de danger
        </h2>
        <p className="text-sm text-muted-foreground">
          Actions irréversibles liées à ce produit.
        </p>
      </div>

      {/* CARD */}
      <div className="border border-red-200 bg-red-50/40 rounded-2xl p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Supprimer ce produit</h3>
          <p className="text-xs text-muted-foreground">
            Cette action supprimera définitivement{" "}
            <span className="font-medium">{productName}</span>, y compris ses
            variantes, images et relations.
          </p>
        </div>

        {/* ACTION */}
        <AlertDialog>
          <AlertDialogTrigger asChild disabled={loading}>
            <Button variant="destructive" className="w-full h-11">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer le produit
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>

              <AlertDialogDescription>
                Vous êtes sur le point de supprimer{" "}
                <span className="font-semibold">{productName}</span>.
                <br />
                Cette action est <strong>irréversible</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Oui, supprimer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProductDangerZone;
