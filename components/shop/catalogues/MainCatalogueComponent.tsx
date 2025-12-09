"use client";
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
import { ProductsTypeWithArticles } from "@/types/shop";
import {
  AccessoriesData,
  CosmeticsData,
  JewelryData,
  MaterialsAccData,
  QualitiesData,
  StatesData,
  TargetData,
  TypeClothesData,
} from "@/utils/data";
import { ColorsData } from "@/utils/dataAdd";
import { returnDataValue } from "@/utils/functions";
import { Shop, Preferences, ProductShop } from "@/lib/generated/prisma/client";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../home/NewArrivalProductSection";
import PaginationSection from "@/components/PaginationSection";
import { useRouter, useSearchParams } from "next/navigation";
import SetValueComponent from "../SetValueComponent";
import { luminanceColor } from "@/utils/shopFunctions";

type Props = {
  shop: Shop;
  products: ProductsTypeWithArticles[];
  preferences: Preferences;
  productsShop: ProductShop[];
  currency: "$" | "CDF";
  exchange: number;
};
const DEBOUNCE_TIME = 1500;
const MainCatalogueComponent = ({
  shop,
  preferences,
  products,
  productsShop,
  currency,
  exchange,
}: Props) => {
  const searchParams = useSearchParams();
  const search = searchParams.get("type") ?? "";
  const targetSearch = searchParams.get("target");
  const brandSearch = searchParams.get("brand");

  const [searchText, setSearchText] = useState(brandSearch ?? "");
  const [type, setType] = useState(search ?? "");
  const [state, setState] = useState("");
  const [quality, setQuality] = useState("");
  const [target, setTarget] = useState(targetSearch ?? "");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
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

  useEffect(() => {
    if (search) {
      setType(search);
    }
  }, [search]);

  useEffect(() => {
    if (targetSearch) {
      setTarget(targetSearch);
    }
  }, [targetSearch]);

  useEffect(() => {
    if (brandSearch) {
      setSearchText(brandSearch);
    }
  }, [brandSearch]);

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
              returnDataValue(pr.material, MaterialsAccData)
                .toLowerCase()
                .includes(debouncedSearchText.toLowerCase()))
        )
        .filter((pr) => {
          if (type === "") {
            return true;
          }
          if (type === "chaussures") return pr.type === "shoes";
          if (type === "vetements") return pr.type !== "shoes";
          if (type === "bijoux" && pr.type)
            return JewelryData.includes(pr.type);
          if (type === "sac" && pr.type) return pr.type.includes("bag");

          return pr.type?.includes(type);
        })
        .filter((pr) => pr.state && pr.state.includes(state))
        .filter((pr) =>
          shop.category === "accessoires"
            ? pr.material && pr.material.includes(material)
            : true
        )
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
        .filter((product) => {
          if (color === "") {
            return true;
          }
          return product.Article.some((item: { color: string | string[] }) => {
            return item.color?.includes(color);
          });
        })
        .filter((product) => {
          if (size === "") {
            return true;
          }
          return product.Article.some((item: { size: string | string[] }) => {
            return item.size?.includes(size.toLowerCase());
          });
        }),
    [
      products,
      debouncedSearchText,
      type,
      state,
      shop.category,
      material,
      target,
      quality,
      color,
      size,
    ]
  );

  const currentItems = useMemo(
    () => filteredProducts.slice(firstIndex, lastItemIndex),
    [filteredProducts, firstIndex, lastItemIndex]
  );

  const SizesData =
    useMemo(
      () =>
        Array.from(
          new Set(
            products.flatMap((pr) =>
              pr.Article.map((itm: { size: string }) => itm.size?.toLowerCase())
            )
          )
        ),
      [products]
    ) ?? [];

  // const VolumesData =
  //   useMemo(
  //     () =>
  //       Array.from(
  //         new Set(
  //           products.flatMap((pr) =>
  //             pr.Article.map((itm) => itm.volume?.toLowerCase())
  //           )
  //         )
  //       ),
  //     [products]
  //   ) ?? [];

  // const FlavorData =
  //   useMemo(
  //     () =>
  //       Array.from(
  //         new Set(
  //           products.flatMap((pr) =>
  //             pr.Article.map((itm) => itm.flavor?.toLowerCase())
  //           )
  //         )
  //       ),
  //     [products]
  //   ) ?? [];

  // console.log({ FlavorData, VolumesData });

  // HEADER NUM POSITION
  const Header = preferences.Header;

  if (products.length < 1) {
    return (
      <div className="w-full">
        <div
          className="w-full max-w-7xl flex items-center justify-center flex-col min-h-[70vh] 
        px-2 box-border gap-4 transition-all duration-500 ease-in-out"
        >
          <h1 className="lg:text-5xl text-3xl font-bold">Rien trouvé</h1>
          <SearchX className="lg:size-10 size-12 opacity-70" />
          <p className="lg:text-xl font-light opacity-80 text-center">
            {"Pas encore de produit disponible pour le moment"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-7xl flex flex-col gap-10 items-start justify-start px-4
        ${Number(Header) === 3 ? "pt-24" : "pt-4"}
        `}
    >
      {/* filter */}
      <div className="w-full flex gap-10 item-center place-items-center">
        {/* input search */}
        <div className="relative w-3/4 xl:w-full lg:max-w-xl h-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 z-10" />

          <input
            type="search"
            placeholder="Rechercher un produit..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={`
          w-full 
          border-none outline-none pl-12 outline-gray-500 h-full text-sm
          focus:border-gray-500 focus:outline-gray-500 focus:ring-gray-500
  `}
            style={{
              borderColor: preferences.buttonColor,
              // outline: preferences.buttonColor,
              borderRadius: preferences.buttonRadius,
              color: preferences.textColor,
              backgroundColor:
                luminanceColor(preferences.background) === "dark"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(19, 19, 19, 0.3)",
            }}
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
          setColor={setColor}
          setSize={setSize}
          color={color}
          size={size}
          preferences={preferences}
          SizesData={SizesData}
          material={material}
          setMaterial={setMaterial}
          shop={shop}
        />
      </div>

      {/* catalogues products */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 gap-y-4 lg:gap-y-8 lg:gap-8">
        {currentItems.length ? (
          currentItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              shop={shop}
              preferences={preferences}
              productShopPrice={
                productsShop.find((pr) => product.id === pr.productId)?.price
              }
              productShopPercentage={
                productsShop.find((pr) => product.id === pr.productId)
                  ?.percentage
              }
              productShopPromotion={
                productsShop.find((pr) => product.id === pr.productId)
                  ?.promotion ?? 0
              }
              currency={currency}
              exchange={exchange}
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center col-span-2 lg:col-span-4">
            <p>Aucun produit ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

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

export default MainCatalogueComponent;

type FilterTopTypes = {
  target: string;
  state: string;
  type: string;
  quality: string;
  color: string;
  size: string;
  material: string;
  setSize: React.Dispatch<React.SetStateAction<string>>;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  setState: React.Dispatch<React.SetStateAction<string>>;
  setType: React.Dispatch<React.SetStateAction<string>>;
  setQuality: React.Dispatch<React.SetStateAction<string>>;
  setTarget: React.Dispatch<React.SetStateAction<string>>;
  preferences: Preferences;
  SizesData: (string | undefined)[];
  setMaterial: React.Dispatch<React.SetStateAction<string>>;
  shop: Shop;
};
const TopFilterProductShop = ({
  target,
  state,
  type,
  quality,
  color,
  size,
  setSize,
  setColor,
  setState,
  setType,
  setQuality,
  setTarget,
  SizesData,
  preferences,
  shop,
  material,
  setMaterial,
}: FilterTopTypes) => {
  const router = useRouter();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div
          className="flex item-center justify-center gap-2 hover:cursor-pointer hover:gap-4
        transition-all ease-in-out duration-500 hover:opacity-75
        "
        >
          <span>Filtres</span>
          <SlidersHorizontal className="w-8 flex-shrink-0" />
        </div>
      </SheetTrigger>
      <SheetContent
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
          borderColor: preferences.background,
        }}
        className="bg-white text-black h-[99dvh] overflow-x-hidden overflow-y-auto w-full"
      >
        <SheetHeader>
          <SheetTitle style={{ color: preferences.textColor }}>
            Rechercher par filtre
          </SheetTitle>
          <SheetDescription style={{ color: preferences.textColor }}>
            filtrer par qualité, type, couleur ou bien meme par public ciblé.
          </SheetDescription>
        </SheetHeader>
        <div
          style={{ color: preferences.textColor }}
          className="grid gap-4 p-4 grid-cols-1"
        >
          {/* infos produit */}
          {/* color */}
          <div className="pb-4 border-b">
            <Label>Par Couleur</Label>
            <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
              {ColorsData.map((stat, idx) => (
                <span
                  role="button"
                  key={idx}
                  onClick={() => {
                    setColor(stat.value);
                  }}
                  style={{
                    borderColor:
                      color === stat.value
                        ? preferences.buttonColor
                        : "transparent",
                    borderRadius: preferences.buttonRadius,
                    color: preferences.textColor,
                    backgroundColor:
                      luminanceColor(preferences.background) === "light"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(19, 19, 19, 0.3)",
                  }}
                  className={`group px-4 py-2 item-center cursor-pointer
                  border-2 hover:border-primary flex gap-2 text-sm
                  
                          ${
                            color === stat.value
                              ? "border-primary border-2 text-primary"
                              : "opacity-70 border-secondary"
                          } 
                          transition-all duration-500 ease-in-out rounded opacity-70`}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: stat.value,
                    }}
                    className={`cursor-pointer
                    ${
                      stat.value === "other" || stat.value === "multicolor"
                        ? "bg-fuchsia-950"
                        : ""
                    }
                    `}
                  />
                  <span className="text-sm capitalize">{stat.label}</span>
                </span>
              ))}

              {/* all */}
              <span
                role="button"
                onClick={() => {
                  setColor("");
                }}
                style={{
                  borderColor:
                    color === "" ? preferences.buttonColor : "transparent",
                  borderRadius: preferences.buttonRadius,
                  color: preferences.textColor,
                  backgroundColor:
                    luminanceColor(preferences.background) === "light"
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(19, 19, 19, 0.3)",
                }}
                className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                          ${
                            color === ""
                              ? `border-2 text-[${preferences.buttonColor}]`
                              : "opacity-70 border-secondary"
                          } 
                         cursor-pointer transition-all duration-500 ease-in-out rounded opacity-70`}
              >
                Toutes
              </span>
            </div>
          </div>
          {/* size */}
          <div className="pb-4 border-b">
            <Label>
              Par Taille {shop.category === "cosmetiques" ? "(cm)" : null}
            </Label>
            <div className="mt-4 flex flex-wrap items-start justify-start gap-4">
              {SizesData.map((stat, idx) => (
                <span
                  role="button"
                  key={idx}
                  onClick={() => {
                    setSize(stat!);
                  }}
                  style={{
                    borderColor:
                      size === stat ? preferences.buttonColor : "transparent",
                    borderRadius: preferences.buttonRadius,
                    color: preferences.textColor,
                    backgroundColor:
                      luminanceColor(preferences.background) === "light"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(19, 19, 19, 0.3)",
                  }}
                  className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                          ${
                            size === stat
                              ? " border-2 text-primary"
                              : "opacity-70 border-secondary"
                          } 
                          uppercase tabular-nums
                        cursor-pointer  transition-all duration-500 ease-in-out rounded opacity-70`}
                >
                  <span>{stat}</span>
                </span>
              ))}
              {/* all */}
              <span
                role="button"
                onClick={() => {
                  setSize("");
                }}
                style={{
                  borderColor:
                    size === "" ? preferences.buttonColor : "transparent",
                  borderRadius: preferences.buttonRadius,
                  color: preferences.textColor,
                  backgroundColor:
                    luminanceColor(preferences.background) === "light"
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(19, 19, 19, 0.3)",
                }}
                className={`group px-4 py-2 item-center border-2 hover:border-primary flex flex-col gap-2 text-sm
                          ${
                            size === ""
                              ? `border-2 text-[${preferences.buttonColor}]`
                              : "opacity-70 border-secondary"
                          } 
                            capitalize tabular-nums
                        cursor-pointer transition-all duration-500 ease-in-out rounded opacity-70`}
              >
                Toutes
              </span>
            </div>
          </div>

          {/* type with comp clothes */}
          {shop.category === "vetements" && (
            <SetValueComponent
              title="Par Type"
              TypeData={TypeClothesData}
              setValue={setType}
              value={type}
              preferences={preferences}
              All="Tout"
            />
          )}

          {/* type with comp cosmetics */}
          {shop.category === "cosmetiques" && (
            <SetValueComponent
              title="Par Type"
              TypeData={CosmeticsData}
              setValue={setType}
              value={type}
              preferences={preferences}
              All="Tout"
            />
          )}

          {/* type with comp accs */}
          {shop.category === "accessoires" && (
            <SetValueComponent
              title="Par Type"
              TypeData={AccessoriesData}
              setValue={setType}
              value={type}
              preferences={preferences}
              All="Tout"
            />
          )}

          {/* public cible with comp */}
          {shop.category === "accessoires" && (
            <SetValueComponent
              title="Par Matiere"
              TypeData={MaterialsAccData}
              setValue={setMaterial}
              value={material}
              preferences={preferences}
              All="Tout"
            />
          )}

          {/* public cible with comp accs */}
          {
            <SetValueComponent
              title="Genre ou cible"
              TypeData={TargetData}
              setValue={setTarget}
              value={target}
              preferences={preferences}
              All="Tout"
            />
          }

          {/* qualité with comp accs */}
          {
            <SetValueComponent
              title="Etat du produit"
              TypeData={StatesData}
              setValue={setState}
              value={state}
              preferences={preferences}
              All="Tout"
            />
          }

          {/* quality with comp accs */}
          {
            <SetValueComponent
              title="Qualité du produit"
              TypeData={QualitiesData}
              setValue={setQuality}
              value={quality}
              preferences={preferences}
              All="Toutes"
            />
          }
        </div>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button
              type="button"
              variant={"outline"}
              style={{
                borderRadius: preferences.buttonRadius,
                color: "black",
              }}
            >
              fermer
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              type="button"
              variant={"secondary"}
              onClick={() => {
                // reset filters
                setType("");
                setTarget("");
                setState("");
                setQuality("");
                setColor("");
                setSize("");
                setMaterial("");

                router.replace(`/${shop.slug}/catalogues`);
              }}
              style={{ borderRadius: preferences.buttonRadius }}
            >
              Reinitialiser
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
