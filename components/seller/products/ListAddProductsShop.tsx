"use client";
import { Article, ProductShop, Shop } from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Ellipsis,
  Minus,
  Plus,
  RotateCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PaginationSection from "@/components/PaginationSection";
import ImageSliderCarrousel from "./ImageSliderCarrousel";
import { returnDataValue, returnFormatedMoney } from "@/utils/functions";
import {
  AccessoriesData,
  CosmeticsData,
  MaterialsAccData,
  QualitiesData,
  StatesData,
  TargetData,
  TypeClothesData,
} from "@/utils/data";
import { useRouter } from "next/navigation";
import { addItemToShop, deleteItemToShop } from "@/actions/shopActions";
import { capitalizeText } from "@/utils/shopFunctions";
import { ProductsTypeWithArticles } from "@/types/shop";
import { toast } from "sonner";
import noProduct from "@/public/images/noproduct.jpg";
import SetValueComponent from "../SetValueComponent";

type Props = {
  products: ProductsTypeWithArticles[];
  shop: Shop;
  productsShop: ProductShop[];
  currency: "$" | "CDF";
  exchange: number;
};

const DEBOUNCE_TIME = 600;

const ListAddProductsShop = ({
  products,
  shop,
  productsShop,
  exchange,
  currency,
}: Props) => {
  // Filtres de recherche et d'affichage
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [quality, setQuality] = useState("");
  const [target, setTarget] = useState("");
  const [material, setMaterial] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstIndex = lastItemIndex - itemsPerPage;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, DEBOUNCE_TIME);
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const filteredProducts = useMemo(
    () =>
      products
        .filter(
          (pr) =>
            pr.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
            (pr.brand &&
              pr.brand
                .toLowerCase()
                .includes(debouncedSearchText.toLowerCase())) ||
            pr.description
              .toLowerCase()
              .includes(debouncedSearchText.toLowerCase()) ||
            (pr.type &&
              returnDataValue(pr.type, TargetData).includes(
                debouncedSearchText.toLowerCase()
              )) ||
            (pr.material &&
              returnDataValue(pr.material, AccessoriesData)
                .toLowerCase()
                .includes(debouncedSearchText.toLowerCase()))
        )
        .filter((pr) => pr.type && pr.type.includes(type))
        .filter((pr) => {
          if (shop.category === "accessoires") {
            return pr.material && pr.material.includes(material);
          }
          return true;
        })
        .filter((pr) => pr.state && pr.state.includes(state))
        .filter((pr) => {
          if (target === "unisex") {
            return pr.target === "unisex";
          }
          if (target === "") return true;
          if (target === "men")
            return pr.target === "men" || pr.target === "unisex";
          if (target === "women")
            return pr.target === "women" || pr.target === "unisex";
          return pr.target?.includes(target);
        })
        .filter((pr) => pr.quality && pr.quality.includes(quality)),
    [
      products,
      debouncedSearchText,
      type,
      shop.category,
      material,
      state,
      target,
      quality,
    ]
  );

  const currentItems = useMemo(
    () => filteredProducts.slice(firstIndex, lastItemIndex),
    [filteredProducts, firstIndex, lastItemIndex]
  );

  if (products.length < 1) {
    return (
      <div
        className="min-h-64 flex items-center justify-center flex-col w-full 
      text-center text-muted-foreground max-w-4xl mx-auto border rounded-xl shadow bg-muted/60"
      >
        <p className="text-lg md:text-2xl mb-1">
          Aucun produit trouvé à ajouter à votre boutique.
        </p>
        <p className="text-sm">Réessayez plus tard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Barre de recherche/filtres */}
      <div className="flex flex-col md:flex-row w-full gap-4 items-center md:items-end">
        {/* input search */}
        <div className="relative w-3/4 xl:w-full lg:max-w-xl">
          <Search
            className="absolute size-5 text-gray-500
          top-1/2  transform -translate-y-1/2 left-2
          "
          />
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className=" pl-12 w-full shadow rounded-xl border"
          />
        </div>
        {/* laisse ici pour un eventuel filtre avancé */}
        <TopFilterProductShop
          type={type}
          material={material}
          state={state}
          target={target}
          quality={quality}
          setMaterial={setMaterial}
          setState={setState}
          setTarget={setTarget}
          setQuality={setQuality}
          setType={setType}
          shop={shop}
        />
      </div>
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((product) => (
            <ProductCardAddShop
              key={product.id}
              product={product}
              shop={shop}
              productsShop={productsShop}
              currency={currency}
              exchange={exchange}
            />
          ))}
        </div>
      ) : (
        <div
          className="min-h-64 flex items-center justify-center flex-col w-full 
        text-center text-muted-foreground max-w-4xl mx-auto border rounded-xl shadow bg-muted/60"
        >
          <p className="text-lg md:text-2xl mb-1">Aucun produit trouvé.</p>
          <p className="text-sm">Revoyez vos filtres.</p>
        </div>
      )}

      {/* Pagination */}
      <PaginationSection
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        lastItemIndex={lastItemIndex}
        firstIndex={firstIndex}
        currentItems={currentItems}
        totalItems={filteredProducts.length}
      />
    </div>
  );
};

export default ListAddProductsShop;

// ============================
// ==== CARD PRODUIT ==========
type ProductCardType = {
  product: ProductsTypeWithArticles;
  shop: Shop;
  productsShop: ProductShop[];
  currency: "$" | "CDF";
  exchange: number;
};

function ProductCardAddShop({
  product,
  shop,
  productsShop,
  currency,
  exchange,
}: ProductCardType) {
  const isInShopProduct = useMemo(
    () =>
      productsShop.find(
        (ps) => ps.productId === product.id && ps.shopId === shop.id
      ),
    [productsShop, product.id, shop.id]
  );
  const isInShop = !!isInShopProduct;
  const articles = product.Article as Article[];
  const totalQuantity = articles.reduce(
    (acc, article) => acc + article.stock,
    0
  );

  // Design card moderne
  return (
    <Card
      className="relative flex flex-col h-full rounded-2xl shadow group 
    transition hover:shadow-lg ring-0 hover:ring-primary/20 border"
    >
      <CardHeader className="p-0 -mt-6">
        <div className="relative w-full h-56 overflow-hidden rounded-t-2xl">
          <Image
            src={product.image || noProduct}
            alt={product.name}
            fill
            className="object-cover w-full h-full group-hover:scale-105 
            transition-transform duration-500 ease-in-out bg-muted"
            priority
            sizes="(max-width:600px) 100vw, 33vw"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge
              variant="secondary"
              className="capitalize text-xs px-2 py-1 rounded-md"
            >
              {returnDataValue(product?.quality, QualitiesData)}
            </Badge>
            {isInShop && (
              <Badge
                variant="outline"
                className="  bg-black/40 text-white font-semibold text-xs"
              >
                Déjà ajouté
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between w-full gap-2">
          <span className="font-semibold text-base line-clamp-1 capitalize">
            {product.name}
          </span>
          <AddProductToShopSheet
            product={product}
            shop={shop}
            productsShop={productsShop}
            currency={currency}
            exchange={exchange}
          />
        </div>
        <div className="flex items-end justify-between gap-1 mt-2">
          <span className="text-primary font-bold tabular-nums text-lg">
            {returnFormatedMoney(product.price * exchange)}{" "}
            <span className="text-xs font-light">{currency}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            <strong>
              {totalQuantity > 0 ? String(totalQuantity).padStart(2, "0") : "0"}
            </strong>{" "}
            en stock
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// =============== ADD PRODUCT SHEET ================
export function AddProductToShopSheet({
  product,
  shop,
  productsShop,
  currency,
  exchange,
}: ProductCardType) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isInShopProduct = useMemo(
    () =>
      productsShop.find(
        (ps) => ps.productId === product.id && ps.shopId === shop.id
      ),
    [productsShop, product.id, shop.id]
  );
  const isInShop = Boolean(isInShopProduct);

  const [percentage, setPercentage] = useState(
    isInShop && isInShopProduct?.percentage ? isInShopProduct.percentage : 5
  );

  const articles = product.Article as Article[];
  const totalQuantity = articles.reduce(
    (acc, article) => acc + article.stock,
    0
  );
  const benefit = Math.round((percentage * product.price) / 100);
  const totalPrice = product.price + benefit;
  const images = [product.image, ...(product.images ?? [])];

  const handleClickAdd = async () => {
    if (isInShop) return;
    setLoading(true);
    try {
      const newProductShop = {
        productId: product.id,
        shopId: shop.id,
        percentage,
        price: totalPrice,
      };
      const addNewItem = await addItemToShop({ ...newProductShop });
      if (!addNewItem) {
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de l'ajout du produit",
        });
        return;
      }
      toast.success("Produit ajouté", {
        description: "Ce produit a été ajouté avec succès.",
      });
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur", { description: err.message });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!isInShopProduct) return;
    setLoading(true);
    try {
      const deleteItem = await deleteItemToShop({
        productShopId: isInShopProduct.id,
      });
      if (!deleteItem) {
        toast.error("Erreur", {
          description:
            "Une erreur est survenue lors de la suppression du produit",
        });
        return;
      }
      toast.success("Produit supprimé", {
        description: "Ce produit a été supprimé avec succès.",
      });
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur", { description: err.message });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border hover:bg-muted"
          title={isInShop ? "Configurer / Retirer du shop" : "Ajouter au shop"}
        >
          <Ellipsis className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="bg-background text-foreground w-full md:w-[420px] max-w-full 
      overflow-y-auto flex flex-col px-0"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>
            {isInShop ? "Configurer le produit" : "Ajouter un produit"}
          </SheetTitle>
          <SheetDescription>
            <span>
              Définis ton bénéfice pour calculer le prix total à la revente.
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {/* IMAGE CAROUSEL */}
          <div className="w-full h-48 md:h-56 rounded-xl overflow-hidden mb-4 border">
            <ImageSliderCarrousel images={images} custom_height="100%" />
          </div>
          {/* INFOS PRODUIT */}
          <div className="space-y-2 text-sm mb-4">
            <InfoLine label="Nom du produit" value={product.name} />
            {product?.type && (
              <InfoLine
                label="Type du produit"
                value={
                  product?.category === "vetements"
                    ? returnDataValue(product.type, TypeClothesData)
                    : product?.category === "accessoires"
                    ? returnDataValue(product.type, AccessoriesData)
                    : ""
                }
              />
            )}
            {product?.category === "accessoires" && product?.material && (
              <InfoLine
                label="Matériau"
                value={returnDataValue(product.material, MaterialsAccData)}
              />
            )}
            {product?.quality && (
              <InfoLine
                label="Qualité"
                value={returnDataValue(product.quality, QualitiesData)}
              />
            )}
            {product?.state && (
              <InfoLine
                label="État"
                value={returnDataValue(product.state, StatesData)}
              />
            )}
            {product?.target && (
              <InfoLine
                label="Public"
                value={returnDataValue(product.target, TargetData)}
              />
            )}
            {product?.brand && (
              <InfoLine label="Marque" value={product.brand} />
            )}
            <InfoLine
              label="Stock"
              value={
                <span>
                  {String(totalQuantity).padStart(2, "0")}{" "}
                  <span className="font-normal">dispo</span>
                </span>
              }
            />
            <InfoLine
              label="Description"
              value={
                <span>
                  {capitalizeText(product.description.slice(0, 135))}
                  {product.description.length > 138 ? "..." : ""}
                </span>
              }
            />
          </div>
          {/* PRIX & PROFIT */}
          <div className="rounded-xl p-4 border bg-muted/40 mb-3 space-y-3">
            <PriceLine
              label="Prix Min."
              value={
                returnFormatedMoney(product.price * exchange) + " " + currency
              }
            />
            <PriceLine
              label="Bénéfice"
              value={returnFormatedMoney(benefit * exchange) + " " + currency}
            />
            <PriceLine
              label="Prix total"
              value={
                returnFormatedMoney(totalPrice * exchange) + " " + currency
              }
            />
            {/* Contrôle pourcentage */}
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">Pourcentage</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-8 w-8"
                  disabled={loading || percentage <= 0}
                  onClick={() => setPercentage(Math.max(0, percentage - 5))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold tabular-nums text-base min-w-[32px] text-center">
                  {percentage}%
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-8 w-8"
                  disabled={loading || percentage >= 400}
                  onClick={() => setPercentage(Math.min(400, percentage + 5))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="gap-2 px-6 py-5 border-t">
          <SheetClose asChild>
            <Button disabled={loading} variant="outline" className="rounded-lg">
              Annuler
            </Button>
          </SheetClose>
          {!isInShop ? (
            <SheetClose asChild>
              <Button
                onClick={handleClickAdd}
                disabled={loading}
                className="rounded-lg"
              >
                Ajouter
              </Button>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteItem}
                disabled={loading}
                className="rounded-lg"
              >
                Retirer
              </Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Helpers pour lignes d'info/prix contrôles
const InfoLine = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <span className="font-medium">{value}</span>
  </div>
);

const PriceLine = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <span className="font-bold tabular-nums">{value}</span>
  </div>
);

type FilterTopTypes = {
  target: string;
  state: string;
  type: string;
  quality: string;
  material: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
  setType: React.Dispatch<React.SetStateAction<string>>;
  setQuality: React.Dispatch<React.SetStateAction<string>>;
  setTarget: React.Dispatch<React.SetStateAction<string>>;
  setMaterial: React.Dispatch<React.SetStateAction<string>>;
  shop: Shop;
};

const TopFilterProductShop = ({
  target,
  state,
  type,
  quality,
  material,
  setState,
  setType,
  setQuality,
  setTarget,
  setMaterial,
  shop,
}: FilterTopTypes) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full shadow hover:bg-accent font-medium"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filtres</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="bg-background text-foreground h-[100dvh] w-full max-w-md md:max-w-[380px] py-0 px-0 overflow-y-auto flex flex-col shadow-xl"
        side="right"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>Filtres avancés</SheetTitle>
          <SheetDescription>
            Filtrer rapidement vos produits par catégorie, qualité, état ou
            cible.
          </SheetDescription>
        </SheetHeader>

        {/* FILTRES */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {shop.category === "vetements" && (
            <SetValueComponent
              setValue={setType}
              TypeData={TypeClothesData}
              value={type}
              title="Type de vêtement"
            />
          )}
          {shop.category === "cosmetiques" && (
            <SetValueComponent
              setValue={setType}
              TypeData={CosmeticsData}
              value={type}
              title="Catégorie cosmétique"
            />
          )}
          {shop.category === "accessoires" && (
            <>
              <SetValueComponent
                setValue={setType}
                TypeData={AccessoriesData}
                value={type}
                title="Type d'accessoire"
              />
              <SetValueComponent
                setValue={setMaterial}
                TypeData={MaterialsAccData}
                value={material}
                title="Matière"
              />
            </>
          )}
          <SetValueComponent
            setValue={setTarget}
            TypeData={TargetData}
            value={target}
            title="Genre / public cible"
          />
          <SetValueComponent
            setValue={setState}
            TypeData={StatesData}
            value={state}
            title="État du produit"
          />
          <SetValueComponent
            setValue={setQuality}
            TypeData={QualitiesData}
            value={quality}
            title="Qualité"
          />
        </div>

        {/* FOOTER */}
        <SheetFooter className="w-full bg-muted/40 px-6 py-5 flex gap-3 justify-end border-t">
          <SheetClose asChild>
            <Button
              variant="outline"
              className="rounded-md font-semibold"
              type="button"
            >
              Fermer
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="gap-2 rounded-md font-semibold"
              onClick={() => {
                setType("");
                setTarget("");
                setState("");
                setQuality("");
                setMaterial("");
              }}
              title="Réinitialiser les filtres"
            >
              <RotateCw className="w-4 h-4" />
              Réinitialiser
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
