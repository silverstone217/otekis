"use client";
import { Article, Product, ProductShop, Shop } from "@prisma/client";
// import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import noProduct from "@/public/images/noproduct.jpg";
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
import {
  applyPromotionOnProfit,
  // calculateDiscountPercentage,
  returnDataValue,
  returnFormatedMoney,
} from "@/utils/functions";
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
import { modifyItemToShop, deleteItemToShop } from "@/actions/shopActions";
import { Input } from "@/components/ui/input";
import PaginationSection from "@/components/PaginationSection";
import ImageSliderCarrousel from "./ImageSliderCarrousel";
import { ProductWithArticle } from "@/types/data";
import SetValueComponent from "../SetValueComponent";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductShopTypeWithProducts = ProductShop & { product: Product };

type Props = {
  products: ProductWithArticle[];
  shop: Shop;
  productsShop: ProductShopTypeWithProducts[];
  setProductsShop: React.Dispatch<
    React.SetStateAction<ProductShopTypeWithProducts[]>
  >;
  currency: "$" | "CDF";
  exchange: number;
};

const DEBOUNCE_TIME = 1500;

const ListModifyProductsShop = ({
  products,
  shop,
  productsShop,
  setProductsShop,
  currency,
  exchange,
}: Props) => {
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [quality, setQuality] = useState("");
  const [target, setTarget] = useState("");
  const [material, setMaterial] = useState("");

  //   debounce
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  // Paginations
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
        .filter((pr) => pr.state && pr.state.includes(state))
        .filter((pr) => {
          if (target === "unisex") {
            return (
              // pr.target === "men" ||
              // pr.target === "women" ||
              pr.target === "unisex"
            );
          }
          if (target === "") {
            return true;
          }
          if (target == "men") {
            return pr.target === "men" || pr.target === "unisex";
          }
          if (target == "women") {
            return pr.target === "women" || pr.target === "unisex";
          }
          return pr.target?.includes(target);
        })
        .filter((pr) => pr.quality && pr.quality.includes(quality))
        .filter((pr) => {
          if (shop.category === "accessoires") {
            return pr.material && pr.material.includes(material);
          }
          return true;
        }),
    [
      products,
      debouncedSearchText,
      type,
      state,
      target,
      quality,
      shop.category,
      material,
    ]
  );

  const currentItems = useMemo(
    () => filteredProducts.slice(firstIndex, lastItemIndex),
    [filteredProducts, firstIndex, lastItemIndex]
  );

  if (products.length < 1) {
    return (
      <div
        className="min-h-64 flex item-center justify-center flex-col w-full text-center 
      text-gray-600 max-w-4xl mx-auto border shadow"
      >
        <p className="text-xl xl:text-2xl text-gray-600">
          Aucun produit trouvé à ajouter à votre boutique.
        </p>
        <p>Reéssayez de revenir plus!</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* filter */}
      <div className="w-full flex justify-between gap-2 item-center max-w-7xl">
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
        {/* sheet Button */}
        <TopFilterProductShop
          target={target}
          setTarget={setTarget}
          type={type}
          setType={setType}
          quality={quality}
          setQuality={setQuality}
          state={state}
          setState={setState}
          setMaterial={setMaterial}
          material={material}
          shop={shop}
        />
      </div>
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* <ProductCard /> */}
          {
            currentItems.map((product) => (
              <ListAddProductCard
                key={product.id}
                product={product}
                shop={shop}
                productsShop={productsShop}
                setProductsShop={setProductsShop}
                currency={currency}
                exchange={exchange}
              />
            ))
            // Add ProductCard here if there are more than 6 products
          }
          {/* AddProductCard */}
        </div>
      ) : (
        <div className="min-h-64 flex items-center justify-center flex-col w-full text-center text-muted-foreground max-w-4xl mx-auto border rounded-xl shadow bg-muted/60">
          <p className="text-lg md:text-2xl mb-1">Aucun produit trouvé.</p>
          <p className="text-sm">Revoyez vos filtres.</p>
        </div>
      )}

      {/* pagination section */}
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

type ProductCardType = {
  product: ProductWithArticle;
  shop: Shop;
  productsShop: ProductShop[];
  setProductsShop: React.Dispatch<
    React.SetStateAction<ProductShopTypeWithProducts[]>
  >;
  currency: "$" | "CDF";
  exchange: number;
};

export const ListAddProductCard = ({
  product,
  shop,
  productsShop,
  setProductsShop,
  currency,
  exchange,
}: ProductCardType) => {
  const isInShopProduct = useMemo(
    () =>
      productsShop.find(
        (ps) => ps.productId === product.id && ps.shopId === shop.id
      ),
    [productsShop, product.id, shop.id]
  );
  const isInShop = !!isInShopProduct;
  const promotion = isInShopProduct?.promotion || 0;
  const benefit = isInShopProduct?.percentage
    ? Math.round((isInShopProduct.percentage * product.price) / 100)
    : 0;
  const beneficeAfterDiscount = applyPromotionOnProfit(benefit, promotion);
  const totalPriceAfterDiscount = product.price + beneficeAfterDiscount;
  const articles = product.Article as { stock: number }[];
  const totalQuantity = articles.reduce((acc, a) => acc + a.stock, 0);

  return (
    <Card
      className={cn(
        "group relative w-full md:max-w-xs min-h-[360px] flex flex-col justify-between rounded-xl shadow border hover:shadow-lg transition-all duration-300",
        isInShop && "ring-2 ring-primary/30"
      )}
    >
      <CardHeader className="p-0 -mt-6">
        <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
          <Image
            src={product.image || noProduct}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out bg-muted"
            sizes="(max-width: 600px) 100vw, 25vw"
            priority
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1 rounded-lg capitalize"
              // onClick={() =>
              //   console.log({
              //     beneficeAfterDiscount,
              //     benefit,
              //     promotion,
              //     percent: isInShopProduct?.percentage,
              //   })
              // }
            >
              {returnDataValue(product?.quality, QualitiesData)}
            </Badge>
            {isInShop && (
              <Badge
                variant="outline"
                className="text-xs  bg-black/40 text-white"
              >
                Déjà ajouté
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4 py-3">
        <span className="font-semibold text-base line-clamp-1 capitalize">
          {product.name}
        </span>
        <div className="flex items-center justify-between">
          {promotion > 0 ? (
            <>
              <span className="text-primary font-bold tabular-nums text-lg">
                {returnFormatedMoney(totalPriceAfterDiscount * exchange)}{" "}
                <span className="text-xs font-light">{currency}</span>
              </span>
              <span className="line-through text-muted-foreground/70 text-xs">
                {isInShopProduct
                  ? returnFormatedMoney(isInShopProduct.price * exchange) +
                    " " +
                    currency
                  : ""}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary tabular-nums">
              {isInShopProduct ? (
                <>
                  {returnFormatedMoney(isInShopProduct.price * exchange)}{" "}
                  <span className="text-xs font-light">{currency}</span>
                </>
              ) : (
                <>
                  {returnFormatedMoney(product.price * exchange)}{" "}
                  <span className="text-xs font-light">{currency}</span>
                </>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-sm text-muted-foreground">
            <strong>{String(totalQuantity)}</strong> en stock
          </span>
          <AddProductToShopSheet
            product={product}
            shop={shop}
            productsShop={productsShop}
            setProductsShop={setProductsShop}
            isInShopProduct={isInShopProduct}
            isInShop={isInShop}
            currency={currency}
            exchange={exchange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

type ProductAddItemType = {
  product: ProductWithArticle;
  shop: Shop;
  productsShop: ProductShop[];
  setProductsShop: React.Dispatch<
    React.SetStateAction<ProductShopTypeWithProducts[]>
  >;
  isInShopProduct: ProductShop | undefined;
  isInShop: boolean;
  currency: "$" | "CDF";
  exchange: number;
};
// Add to shop function
export function AddProductToShopSheet({
  product,
  shop,
  setProductsShop,
  isInShopProduct,
  isInShop,
  currency,
  exchange,
}: ProductAddItemType) {
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(
    isInShop && isInShopProduct?.percentage ? isInShopProduct.percentage : 5
  );
  const [promotion, setPromotion] = useState(
    isInShop && isInShopProduct?.promotion ? isInShopProduct.promotion : 0
  );

  // Calcules
  const benefit = Math.round((percentage * product.price) / 100);
  const beneficeAfterDiscount = applyPromotionOnProfit(benefit, promotion);
  const totalPrice = product.price + benefit;
  const totalPriceAfterDiscount = product.price + beneficeAfterDiscount;
  const articles = product.Article as { stock: number }[];
  const totalQuantity = articles.reduce((acc, a) => acc + a.stock, 0);
  const router = useRouter();

  const handleClickModify = async () => {
    if (!isInShop || !isInShopProduct) {
      toast.error("Erreur", {
        description: "Vous n'avez pas le droit de modifier cer produit!",
      });
      return;
    }
    setLoading(true);
    try {
      const newProductShop = {
        productShopId: isInShopProduct.id,
        percentage,
        price: totalPrice,
        promotion: promotion,
      };
      const addNewItem = await modifyItemToShop({ ...newProductShop });
      if (!addNewItem) {
        toast.error("Erreur", {
          description:
            "Une erreur est survenue lors de la modification du produit",
        });
        return;
      }

      toast.success("Produit modifié", {
        description: "Ce produit vient d'etre ajouté avec success",
      });
      isInShopProduct.price = addNewItem?.data
        ? addNewItem.data.price
        : totalPrice;
      setProductsShop((prev) =>
        prev.map((pr) =>
          pr.id === isInShopProduct.id && addNewItem?.data?.percentage
            ? { ...pr, percentage: addNewItem?.data.percentage }
            : pr
        )
      );
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur", {
        description:
          "Une erreur est survenue lors de la modification du produit",
      });
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
        toast.error("Erreur survenue!", {
          description:
            "Une erreur est survenue lors de la suppression du produit",
        });
        return;
      }
      toast.success("Produit supprimé", {
        description: "Ce produit vient d'etre supprimé avec success",
      });

      setProductsShop((prev) =>
        prev.filter((pr) => pr.id !== isInShopProduct.id)
      );

      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur survenue!", {
        description:
          "Une erreur est survenue lors de la suppression du produit",
      });

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isModified =
    (percentage !== isInShopProduct?.percentage ||
      promotion !== isInShopProduct?.promotion) &&
    isInShop;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full h-8 w-8 flex items-center justify-center p-0 border"
          title="Configurer"
        >
          <Ellipsis className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={cn(
          "max-w-full w-[400px] sm:w-[440px] md:w-[520px] p-0",
          "bg-background flex flex-col "
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>Ajouter ou modifier le produit</SheetTitle>
          <SheetDescription>
            Définissez votre profit et votre promo, le prix total s’ajuste
            automatiquement.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {/* IMAGE CAROUSEL */}
          <div className="w-full h-48 md:h-56 rounded-xl overflow-hidden mb-4 border">
            <ImageSliderCarrousel
              images={[product.image, ...(product.images || [])]}
              custom_height="100%"
            />
          </div>
          {/* INFOS PRODUIT */}
          <div className="space-y-2 text-sm mb-4">
            <InfoLine label="Nom du produit" value={product.name} />
            {product?.type && (
              <InfoLine
                label="Type du produit"
                value={
                  product?.category === "vetements"
                    ? returnDataValue(product?.type, TypeClothesData)
                    : product?.category === "accessoires"
                    ? returnDataValue(product?.type, AccessoriesData)
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
                label="Etat"
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
                  {totalQuantity.toString()}{" "}
                  <span className="font-normal">dispo</span>
                </span>
              }
            />
          </div>
          {/* PRIX & REGLAGES */}
          <div className="rounded-xl p-4 border bg-muted/50 mb-3 space-y-3">
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
            {/* Pourcentage */}
            <ControlLine
              label="Pourcentage"
              value={percentage}
              min={0}
              max={400}
              step={5}
              onChange={setPercentage}
              icon={<Plus />}
              disabled={loading}
            />
            {/* Avec promotion */}
            {promotion > 0 && (
              <>
                <PriceLine
                  label="Bénéfice (promo)"
                  value={
                    returnFormatedMoney(beneficeAfterDiscount * exchange) +
                    " " +
                    currency
                  }
                />
                <PriceLine
                  label="Prix total (promo)"
                  value={
                    returnFormatedMoney(totalPriceAfterDiscount * exchange) +
                    " " +
                    currency
                  }
                />
              </>
            )}
            {/* Promotion */}
            <ControlLine
              label="Promotion (%)"
              value={promotion}
              min={0}
              max={100}
              step={5}
              onChange={setPromotion}
              icon={<Plus />}
              disabled={loading}
            />
          </div>
        </div>
        <SheetFooter
          className={cn("gap-2 px-6 py-5 bg-background border-t flex-nowrap")}
        >
          <SheetClose asChild>
            <Button disabled={loading} variant="outline" className="rounded-lg">
              Annuler
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              type="button"
              onClick={handleClickModify}
              disabled={loading || !isModified}
              className="rounded-lg"
            >
              Modifier
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteItem}
              disabled={loading || !isInShop}
              className="rounded-lg"
            >
              Retirer
            </Button>
          </SheetClose>
        </SheetFooter>
        {/* Info note */}
        {promotion > 0 && (
          <div className="text-xs opacity-70 text-center px-6 pb-3 pt-1">
            <span className="font-bold">Note :</span> La promotion est à votre
            charge.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Helpers, minimal custom components
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
const ControlLine = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  icon: React.ReactNode;
  disabled: boolean;
}) => (
  <div className="flex items-center justify-between gap-2">
    <Label className="text-xs">{label}</Label>
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        className="rounded-full w-8 h-8"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="font-bold tabular-nums text-base min-w-[32px] text-center">
        {value}%
      </span>
      <Button
        size="icon"
        variant="outline"
        className="rounded-full w-8 h-8"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
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

export default ListModifyProductsShop;
