"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Grid2x2, PrinterCheck, BetweenHorizontalEnd, X } from "lucide-react";
import { AllProductsTypes, CategoriesData } from "@/utils/data";
import { Product } from "@/lib/generated/prisma/client";
import { returnDataValue } from "@/utils/functions";
import { PrintProductByCatOrTypes } from "@/actions/printActions";
import { capitalizeText } from "@/utils/shopFunctions";
import { toast } from "sonner";

const PrintProductsBtn = () => {
  const [selection, setSelection] = useState<"types" | "categories" | "">("");
  const [selected, setSelected] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if (!products || products.length < 1) {
    //   alert("La liste des produits est vide!");
    // }

    if (products && products.length > 0) {
      const timer = setTimeout(() => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          alert(
            "Impossible d'ouvrir la fenêtre d'impression. Veuillez vérifier que les pop-ups sont autorisés."
          );
          return;
        }
        printWindow.document.open();
        const htmlContent = `
          <html>
            <head>
              <title>Liste des produits à imprimer</title>
              <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background: #f7f7f7; }
              </style>
            </head>
            <body>
              <h2>Liste des produits</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>UID</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                  </tr>
                </thead>
                <tbody>
                  ${products
                    .map(
                      (p) => `
                        <tr>
                          <td>${p.id}</td>
                          <td>${p.uid || ""}</td>
                          <td>${capitalizeText(p.name)}</td>
                          <td>${capitalizeText(
                            returnDataValue(p.category, CategoriesData)
                          )}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </body>
          </html>
        `;
        printWindow.document.writeln(htmlContent);

        printWindow.document.close();

        // Déclencher l'impression
        printWindow.print();

        printWindow.onafterprint = () => {
          printWindow.close();
          //   setSelection("");
          //   setSelected("");
          //   setProducts([]);
          window.location.reload();
        };
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [products]);

  const HandleGetDataToPrint = async () => {
    try {
      setLoading(true);

      if (!selected && !selection) {
        toast.error("Choisissez une catégorie ou un type à imprimer!");
        return;
      }

      const formData = { selection, selected };

      const result = await PrintProductByCatOrTypes(formData);

      if (result.error) {
        toast.error(result.message);

        return;
      }

      if (result.data.length < 1) {
        toast.error("Liste vide!", {
          description: "Aucun produit trouvé par rapport à votre choix!",
          duration: 3000,
        });
        return;
      }

      setProducts(result.data);

      toast.success(result.message);
    } catch (error) {
      console.log(error);
      toast.error("Oops! Erreur inattendue", {
        description: "Une erreur est survenue, réessayez plus tard!",
        duration: 3000,
      });
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <PrinterCheck className="size-6 shrink-0" />
          <span>Imprimer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="grid overflow-hidden">
        <DialogHeader>
          <DialogTitle>Imprimer les produits</DialogTitle>
          <DialogDescription>
            {`Choisissez comment vous souhaitez ou que voulez-vous imprimer en cliquant sur l'un des boutons ci-dessous`}
          </DialogDescription>
        </DialogHeader>

        {/* choice cat or type */}
        {!selection && (
          <div
            className="flex gap-4 item-center justify-center flex-wrap
          transition-all duration-500 ease-in-out
          "
          >
            {/* By cat */}
            <Button
              variant={"secondary"}
              onClick={() => setSelection("categories")}
              disabled={loading}
            >
              <Grid2x2 className="size-6 shrink-0" />
              <span>Par categories</span>
            </Button>

            {/* By types */}
            <Button
              variant={"secondary"}
              onClick={() => setSelection("types")}
              disabled={loading}
            >
              <BetweenHorizontalEnd className="size-6 shrink-0" />
              <span>Par Types</span>
            </Button>
          </div>
        )}

        {/* choice cats item list */}
        {selection === "categories" && (
          <div
            className="flex gap-4 item-center justify-start flex-wrap
            transition-all duration-500 ease-in-out
            "
          >
            {CategoriesData.map((item, idx) =>
              selected === "" ? (
                <Button
                  key={idx}
                  variant={"secondary"}
                  onClick={() => setSelected(item.value)}
                  disabled={loading}
                >
                  <item.icon className="size-6 shrink-0" />
                  <span>{item.label}</span>
                </Button>
              ) : null
            )}

            {/* print button */}
            {selected !== "" ? (
              <Button
                variant={"default"}
                onClick={() => HandleGetDataToPrint()}
                disabled={loading}
              >
                <PrinterCheck className="size-6 shrink-0" />
                <span>
                  Imprimer les produits de{" "}
                  {returnDataValue(selected, CategoriesData)}
                </span>
              </Button>
            ) : null}

            {/* Cancel button */}

            <Button
              variant={"outline"}
              onClick={() => {
                setSelection("");
                setSelected("");
                setProducts([]);
              }}
              disabled={loading}
            >
              <X className="size-6 shrink-0" />
              <span>Annuler</span>
            </Button>
          </div>
        )}

        {/* choice types item list */}
        {selection === "types" && (
          <div
            className="flex gap-4 item-center justify-start flex-wrap
            transition-all duration-500 ease-in-out max-h-[60dvh] overflow-y-auto
            overflow-x-hidden
            "
          >
            {AllProductsTypes.map((item, idx) =>
              selected === "" ? (
                <Button
                  key={idx}
                  variant={"secondary"}
                  onClick={() => setSelected(item.value)}
                  disabled={loading}
                >
                  {/* <item.icon className="size-6 shrink-0" /> */}
                  <span>{item.label}</span>
                </Button>
              ) : null
            )}

            {/* print button */}
            {selected !== "" ? (
              <Button
                variant={"default"}
                onClick={() => HandleGetDataToPrint()}
                disabled={loading}
              >
                <PrinterCheck className="size-6 shrink-0" />
                <span>
                  Imprimer les produits de{" "}
                  {returnDataValue(selected, AllProductsTypes)}
                </span>
              </Button>
            ) : null}

            {/* Cancel button */}

            <Button
              variant={"outline"}
              onClick={() => {
                setSelection("");
                setSelected("");
                setProducts([]);
              }}
              disabled={loading}
            >
              <X className="size-6 shrink-0" />
              <span>Annuler</span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrintProductsBtn;
