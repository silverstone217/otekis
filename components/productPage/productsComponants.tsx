"use client";
import React, { useState, useMemo } from "react";
import { ProductWithArticle } from "@/types/data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Package, Info } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CategoriesData } from "@/utils/data";
import { capitalizeText } from "@/utils/shopFunctions";
import { OtekisPreferences } from "@/lib/generated/prisma/client";

export default function ProductGallery({
  initialProducts,
  prefs,
}: {
  initialProducts: ProductWithArticle[];
  prefs: OtekisPreferences;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithArticle | null>(null);

  // Logique de filtrage
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, initialProducts]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <div className="space-y-8">
      {/* SECTION FILTRES */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>

            {CategoriesData.map((cat) => {
              return (
                <SelectItem value={cat.value} key={cat.value}>
                  {cat.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={resetFilters} className="gap-2">
          <RotateCcw className="size-4" /> Réinitialiser
        </Button>
      </div>

      {/* LISTE DES PRODUITS */}
      <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedProduct(product)}
              className="group cursor-pointer bg-white dark:bg-neutral-900 rounded-xl border overflow-hidden transition-all hover:shadow-xl"
            >
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-white/90 text-black backdrop-blur-sm">
                  {product.quality}
                </Badge>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-[10px] uppercase font-bold text-blue-600">
                  {product.category}
                </p>
                <h3 className="font-bold truncate text-sm">{product.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Package className="size-3" />
                  Stock: {product.Article.reduce((a, b) => a + b.stock, 0)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* MODALE DE DÉTAILS */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent
          className="
      max-w-3xl p-0
      h-[90vh]
      overflow-hidden
    "
        >
          {selectedProduct && (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* IMAGE (top) */}
              <div className="relative w-full aspect-square bg-muted">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* CONTENT (scrollable) */}
              <div className="flex-1 ">
                <div className="px-6 py-6 space-y-6">
                  {/* HEADER */}
                  <div className="space-y-2">
                    <Badge className="w-fit">{selectedProduct.category}</Badge>
                    <DialogTitle className="text-2xl font-bold leading-tight">
                      {capitalizeText(selectedProduct.name)}
                    </DialogTitle>
                  </div>

                  {/* PRICE */}
                  <div className="rounded-xl border p-4 flex justify-between items-center bg-muted/40">
                    <span className="text-sm text-muted-foreground">
                      Prix à partir de
                    </span>
                    <span className="text-2xl font-extrabold text-blue-600">
                      {selectedProduct.price.toLocaleString()}{" "}
                      <span className="text-sm">{prefs.currency}</span>
                    </span>
                  </div>

                  {/* STATS */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Qualité</p>
                      <p className="font-semibold">{selectedProduct.quality}</p>
                    </div>

                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Stock total</p>
                      <p className="font-semibold">
                        {selectedProduct.Article.reduce(
                          (a, b) => a + b.stock,
                          0
                        )}{" "}
                        unité(s)
                      </p>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Info className="size-4 text-muted-foreground" />
                      Description
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* EXTRA DETAILS */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Détails supplémentaires</h4>
                    <p className="text-sm text-muted-foreground">
                      Variantes, délais de livraison, conditions, etc.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA (sticky bottom) */}
              <div className="border-t bg-background p-4">
                <Button
                  className="
              w-full h-12 rounded-xl
              text-base font-semibold
              bg-blue-600 hover:bg-blue-700
            "
                >
                  Importer dans ma boutique
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
