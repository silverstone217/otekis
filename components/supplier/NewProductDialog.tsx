"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PackagePlus } from "lucide-react";
import { useState } from "react";
import {
  NewAllProductsTypesWithCategory,
  CategoriesData,
  QualitiesData,
  StatesData,
} from "@/utils/data";
import {
  SelectorProducts,
  SelectProductCategory,
  SelectProductType,
} from "./SelectProductCategories";
import { ProductArticles } from "./ProductArticles";
import Image from "next/image";

interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewProductDialog: React.FC<NewProductDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  // const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [quality, setQuality] = useState("");
  const [state, setState] = useState("nouveau"); // pas de choix pour l'instant, que du neuf
  const [brand, setBrand] = useState("");
  const [target, setTarget] = useState("");

  const [articles, setArticles] = useState([
    { color: "", size: "", quantity: 1 },
  ]);

  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 👉 simulate API
    await new Promise((res) => setTimeout(res, 1000));

    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-auto max-h-[90vh] w-full overflow-y-auto rounded-lg p-6 md:w-[500px]">
        <DialogHeader>
          <PackagePlus className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
          <DialogTitle className="text-center">Nouveau Produit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid w-full gap-4 py-4">
          {/* IMAGE */}
          <div className="grid w-full items-center gap-2 justify-center">
            <label htmlFor="image" className="text-sm font-medium w-full">
              Image du produit
            </label>
            {image ? (
              <div
                className="relative w-28 h-36 flex items-center justify-center
              border rounded-md shadow
              "
              >
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Product Image"
                  fill
                  className="object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={() => setImage(null)}
                >
                  X
                </Button>
              </div>
            ) : (
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImage(e.target.files[0]);
                  }
                }}
                className="w-full"
              />
            )}
          </div>

          {/* NAME */}
          <div className="grid w-full items-center gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nom du produit
            </label>
            <Input
              id="name"
              placeholder="Ex: T-shirt Otekis"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="grid w-full items-center gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Ex: Un t-shirt 100% coton bio avec le logo Otekis."
              required
              minLength={5}
              maxLength={2000}
              className="max-h-40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* CATEGORY --- TYPE */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CATEGORY */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Catégorie
              </label>
              <SelectProductCategory
                categories={CategoriesData}
                selectedCategory={category}
                onCategoryChange={(cat) => {
                  setCategory(cat);
                  setType("");
                }}
                required
              />
            </div>

            {/* TYPE */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <SelectProductType
                types={NewAllProductsTypesWithCategory}
                selectedType={type}
                onTypeChange={setType}
                required
                category={category}
                disabled={!category}
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
            {/* QUALITY */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="quality" className="text-sm font-medium">
                Qualité
              </label>
              <SelectorProducts
                data={QualitiesData}
                onChange={setQuality}
                value={quality}
                placeholder="Sélectionnez une qualité"
              />
            </div>

            {/* STATE */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="state" className="text-sm font-medium">
                État
              </label>
              <SelectorProducts
                data={StatesData}
                onChange={setState}
                value={state}
                placeholder="Sélectionnez un état"
                disabled
              />
            </div>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="quality" className="text-sm font-medium">
                Cible
              </label>
              <SelectorProducts
                data={QualitiesData}
                onChange={setTarget}
                value={target}
                placeholder="Sélectionnez une cible"
              />
            </div>

            {/* BRAND */}
            <div className="grid w-full items-center gap-2">
              <label htmlFor="state" className="text-sm font-medium">
                Marque
              </label>
              <Input
                placeholder="Ex: Nike, Apple..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          {/* PRICE */}
          <div className="grid w-full items-center gap-2">
            <label htmlFor="price" className="text-sm font-medium">
              Prix ($)
            </label>
            <Input
              id="price"
              type="number"
              placeholder="Ex: 29.99"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* ARTICLES */}
          <ProductArticles articles={articles} setArticles={setArticles} />

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "ajout..." : "Ajouter le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
