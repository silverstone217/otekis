"use client";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { toast } from "sonner";
import { ProductWithArticle } from "@/types/data";
import { Article } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { returnDataValue } from "@/utils/functions";

type Props = {
  products: ProductWithArticle[];
};

type OrderStockType = "inferieur" | "egal" | "inferieur-egal";

const OrderStockData = [
  {
    label: "Inferieur",
    value: "inferieur",
  },
  {
    label: "Égal",
    value: "egal",
  },
  {
    label: "Inferieur ou Égal",
    value: "inferieur-egal",
  },
];

const DeleteProductByStock = ({ products }: Props) => {
  const [stock, setStock] = useState(1);
  const [order, setOrder] = useState<OrderStockType>("inferieur");

  const description = useMemo(
    () =>
      `Le stock du produit etait ${returnDataValue(
        order,
        OrderStockData
      )} à ${stock}.`,
    [stock, order]
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (products: ProductWithArticle[]) => {
    try {
      // take all stock for deleting array products
      const productsToDelete = products
        .map((prod) => {
          const articlesStock = prod.Article.reduce(
            (acc: number, article: Article) => {
              return acc + article.stock;
            },
            0
          );

          return {
            ...prod,
            stock: articlesStock,
          };
        })
        .filter((prod) =>
          order === "inferieur"
            ? prod.stock < stock
            : order === "inferieur-egal"
            ? prod.stock <= stock
            : prod.stock === stock
        );

      // console.log({ productsToDelete });

      if (productsToDelete.length < 1) {
        toast.error(`Aucun produit n'a un stock inferieur à ${stock}.`);
        return;
      }

      //  loop to delete
      for (const product of productsToDelete) {
        // Préparer les données à envoyer au backend
        const formData = {
          id: product.id,
          description: description,
        };

        // Appeler l'API pour supprimer le produit
        const response = await fetch("/api/admins/products/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          toast.error("Erreur lors de la suppression du produit", {
            description:
              "Une erreur s'est produite lors de la suppression du produit, veuillez réessayer plus tard!",
          });
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          toast.error("Erreur lors de la suppression du produit", {
            description: data.error,
          });
          throw new Error(data.error);
        }

        // Supprimer les images du stockage Firebase
        const images = [product.image, ...(product.images ?? [])].filter(
          Boolean
        ) as string[];
        for (const image of images) {
          try {
            if (image) await deleteObject(ref(storage, image));
          } catch (error) {
            console.warn(`Erreur suppression image ${image} :`, error);
            // Ne pas stopper la suppression si une image pose problème
          }
        }

        toast.success(`Produit ${product.id} supprimé avec succès`);
      }

      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur lors de la suppression des produits", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={loading}>
        <Button variant={"destructive"}>
          <Trash2 className="size-6 shrink-0" />
          <span>Supprimer par stock</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Voulez-vous vraiment supprimer les produits?
          </DialogTitle>
          <DialogDescription>
            Cette action supprimera tous les produits dont les stocks est{" "}
            {returnDataValue(order, OrderStockData)} à <strong>{stock}</strong>.
            Et cette action est irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex flex-col gap-4 my-2">
          {/* order stock */}

          <RadioGroup
            defaultValue={order}
            onValueChange={(val: OrderStockType) => setOrder(val)}
            className="flex w-full items-center gap-4 flex-wrap"
          >
            {OrderStockData.map((ord, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={ord.value} id={ord.value} />
                <Label htmlFor={ord.value}>{ord.label}</Label>
              </div>
            ))}
          </RadioGroup>

          {/* input stock */}
          <Input
            type="number"
            min={0}
            max={10000}
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>

        {/* contents btn */}

        <div className="w-full flex item-center gap-4 ">
          {/* Cancel button */}
          <DialogClose
            asChild
            onClick={() => {
              setStock(1);
            }}
          >
            <Button variant={"outline"} disabled={loading}>
              <X className="size-6 shrink-0" />
              <span>Annuler</span>
            </Button>
          </DialogClose>

          <DialogClose
            asChild
            onClick={() => handleDelete(products)}
            disabled={loading || products.length < 1}
          >
            <Button variant={"destructive"}>
              <Trash2 className="size-6 shrink-0" />
              <span>Supprimer</span>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductByStock;
