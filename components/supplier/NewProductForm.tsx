"use client";
import { IsAvailableProducts, IsAvailableType } from "@/utils/supplier";
import { PackagePlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { PermittedSellersSelect } from "./PermittedSellersSelect";
import {
  SelectorProducts,
  SelectProductCategory,
  SelectProductType,
} from "./SelectProductCategories";
import { Input } from "../ui/input";
import {
  CategoriesData,
  NewAllProductsTypesWithCategory,
  StatesData,
  TargetData,
} from "@/utils/data";
import { Textarea } from "../ui/textarea";
import { ProductArticles } from "./ProductArticles";
import Image from "next/image";

const NewProductForm = () => {
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

  const [isAvailable, setIsAvailable] = useState<IsAvailableType>("for_all");
  const [permittedSellers, setPermittedSellers] = useState<string[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  const [articles, setArticles] = useState([
    { color: "", size: "", quantity: 1 },
  ]);

  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 👉 simulate API
    await new Promise((res) => setTimeout(res, 1000));

    // setLoading(false);
    // onOpenChange(false);
  }

  useEffect(() => {
    const fetchShops = async () => {
      const res = await fetch("/api/supplier/shops-list");
      const data = await res.json();
      setShops(data);
    };

    fetchShops();
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-4 w-full flex flex-col gap-6">
      {/* TOP TEXT */}
      <div>
        <PackagePlus className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
        <h3 className="text-center">Nouveau Produit</h3>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="grid w-full gap-4 py-4">
        {/* IMAGE */}
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="image" className="text-sm font-medium">
            Image du produit
          </label>

          <div className="w-full">
            {image ? (
              <div
                className="relative w-full h-64 rounded-xl overflow-hidden 
                border bg-gray-100"
              >
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Product Image"
                  fill
                  className="object-cover"
                />

                {/* Bouton supprimer minimaliste */}
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="
                    absolute top-3 right-3
                    h-8 w-8 flex items-center justify-center
                    rounded-full
                    bg-white/80 backdrop-blur
                    border shadow-sm
                    hover:bg-white
                    transition
                    font-bold
                  "
                >
                  ✕
                </button>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="
                  flex flex-col items-center justify-center
                  w-full h-64
                  border border-dashed rounded-xl
                  cursor-pointer
                  hover:bg-gray-50
                  transition
                "
              >
                <div className="text-center space-y-1">
                  <p className="text-sm text-gray-600">Ajouter une image</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                </div>

                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                  className="hidden text-sm"
                />
              </label>
            )}
          </div>
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
            className="text-sm"
          />
        </div>

        {/* BRAND */}
        <div className="grid w-full items-center gap-2">
          <label htmlFor="state" className="text-sm font-medium">
            Marque du produit
          </label>
          <Input
            placeholder="Ex: Nike, Apple..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid w-full items-center gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description du produit
          </label>
          <Textarea
            id="description"
            placeholder="Ex: Un t-shirt 100% coton bio avec le logo Otekis."
            required
            minLength={5}
            maxLength={2000}
            className="max-h-40 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ARTICLES */}
        <ProductArticles articles={articles} setArticles={setArticles} />

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
              Type de produit
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
          {/* <div className="grid w-full items-center gap-2">
              <label htmlFor="quality" className="text-sm font-medium">
                Qualité
              </label>
              <SelectorProducts
                data={QualitiesData}
                onChange={setQuality}
                value={quality}
                placeholder="Sélectionnez une qualité"
              />
            </div> */}

          {/* STATE */}
          <div className="grid w-full items-center gap-2">
            <label htmlFor="state" className="text-sm font-medium">
              État du produit
            </label>
            <SelectorProducts
              data={StatesData}
              onChange={setState}
              value={state}
              placeholder="Sélectionnez un état"
              // disabled
            />
          </div>

          {/* Target */}
          <div className="grid w-full items-center gap-2">
            <label htmlFor="quality" className="text-sm font-medium">
              Cible
            </label>
            <SelectorProducts
              data={TargetData}
              onChange={setTarget}
              value={target}
              placeholder="Sélectionnez une cible"
            />
          </div>
        </div>

        {/* PRICE */}
        <div className="grid w-full items-center gap-2">
          <label htmlFor="price" className="text-sm font-medium">
            Prix ($) du produit
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
            className="text-sm"
          />
        </div>

        {/* Is Available */}
        <div className="grid w-full items-center gap-2">
          <label htmlFor="isAvailable" className="text-sm font-medium">
            Disponibilité du produit
          </label>
          <SelectorProducts
            data={IsAvailableProducts}
            onChange={(val) => {
              setIsAvailable(val as IsAvailableType);
              if (val !== "specific_sellers") {
                setPermittedSellers([]);
              }
            }}
            value={isAvailable}
            placeholder="Sélectionnez une option de disponibilité"
          />
        </div>

        {/* Permitted Sellers (if specific_sellers) */}
        {isAvailable === "specific_sellers" && (
          <div className="grid w-full items-center gap-2">
            <label htmlFor="permittedSellers" className="text-sm font-medium">
              Vendeurs autorisés
            </label>
            <PermittedSellersSelect
              data={shops} // TODO: list of sellers
              value={permittedSellers}
              onChange={setPermittedSellers}
            />
          </div>
        )}

        <div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "ajout..." : "Ajouter le produit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProductForm;
