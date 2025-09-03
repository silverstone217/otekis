import AddToCartButton from "@/components/shop/product/AddToCartButton";
import ImageSliderCarousel from "@/components/shop/product/ImageSliderCarousel";
import SimilarProductsComponent from "@/components/shop/product/SimilarProductsComponent";
import UniqueColorsWithTooltip from "@/components/shop/UniqueColorsWithTooltip";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import {
  AccessoriesData,
  MaterialsAccData,
  QualitiesData,
  StatesData,
  TargetData,
  TypeClothesData,
} from "@/utils/data";
import { ColorsData } from "@/utils/dataAdd";
import {
  applyPromotionOnProfit,
  calculateDiscountPercentage,
  returnDataValue,
  returnFormatedMoney,
} from "@/utils/functions";
import { preferenceDefaults } from "@/utils/preferences";
import { capitalizeText } from "@/utils/shopFunctions";
import { Article, Preferences } from "@prisma/client";
import { SearchX } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";

type Props = {
  params: Promise<{
    slug: string;
    product_id: string;
  }>;
};

const getProductsBySlug = async (shopId: string) => {
  const products = await prisma.product.findMany({
    where: {
      ProductShop: {
        some: {
          shopId,
        },
      },
    },
    include: { Article: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { Article: true },
  });
  return product;
};

const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { Preferences: true, ProductShop: true, user: true },
  });
  return shop;
};

const getCartsByUserId = async (userId: string) => {
  const carts = await prisma.cart.findMany({
    where: { userId },
    include: { article: true, productShop: true },
    orderBy: { createdAt: "desc" },
  });
  return carts;
};

export async function generateMetadata(
  props: Props
): // parent: ResolvingMetadata
Promise<Metadata> {
  const params = await props.params;
  // read route params
  const { slug } = params;

  // fetch data
  const shop = await getShopBySlug(slug);

  if (!shop) {
    return {
      title: "Boutique non trouvée",
      description: "La boutique que vous recherchez n'existe pas.",
    };
  }

  return {
    title: capitalizeText(shop.name),
    description: capitalizeText(shop.description),
    openGraph: {
      title: capitalizeText(shop.name),
      description: capitalizeText(shop.description),
      images: [shop.logo],
      type: "website",
    },
    icons: {
      icon: shop.logo,
    },
  };
}

const page = async (props: Props) => {
  const params = await props.params;
  const { slug, product_id } = params;
  const user = await getUser();
  const isUserBanned = user?.isBanned;

  if (!product_id) {
    return redirect(`/${slug}`);
  }
  if (!slug) throw new Error("Something went wrong!");

  const product = await getProductById(product_id);
  const shop = await getShopBySlug(slug);

  // HEADER NUM POSITION
  const Header = shop?.Preferences?.Header ?? "0";

  if (!product) {
    return (
      <div className="w-full">
        <div
          className="w-full max-w-4xl flex items-center justify-center flex-col min-h-[70dvh] 
    px-2 box-border gap-4 transition-all duration-500 ease-in-out"
        >
          <h1 className="lg:text-4xl text-3xl font-bold">Rien trouvé</h1>
          <SearchX className="lg:size-20 size-16 opacity-70" />
          <p className="lg:text-2xl text-[18px] font-light opacity-80">
            {"Ce produit n'est disponible pas pour le moment"}
          </p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return <div>pas de boutique trouvée.</div>;
  }

  const preferences = shop.Preferences ?? (preferenceDefaults as Preferences);
  const productsShop = shop.ProductShop;
  const productShop = productsShop.find((ps) => ps.productId === product.id);
  const isInShop = !!productShop;
  const userShop = shop.user;
  const isUserShopBanned = userShop.isBanned;

  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();

  const products = await getProductsBySlug(shop.id);

  if (!isInShop) {
    return (
      <div className="w-full">
        <div
          className="w-full max-w-7xl flex items-center justify-center flex-col min-h-[70dvh] 
    px-2 box-border gap-4 transition-all duration-500 ease-in-out"
        >
          <h1 className="lg:text-4xl text-3xl font-bold text-center text-pretty">
            {"Ce produit n'est pas disponible pour le moment"}
          </h1>
          <SearchX className="lg:size-20 size-16 opacity-70" />
          <p className="lg:text-2xl text-[18px] font-light opacity-80 text-balance">
            {
              "Ce produit produit a été retiré de cette boutique ou n'est plus vendue, revenez plus tard!"
            }
          </p>
        </div>
      </div>
    );
  }

  const articles = product.Article;

  const totalQuantity = articles.reduce((acc: number, article: Article) => {
    return acc + article.stock;
  }, 0);

  const images = [product.image, ...product.images];
  // const colors = [...articles.map((ar) => ar.color)];
  const uniqueColors = articles
    .map((ar) => ar.color) // Récupérer toutes les couleurs
    .reduce<string[]>((acc, color) => {
      if (color && !acc.includes(color)) {
        // Vérifier si la couleur n'est pas déjà dans l'accumulateur
        acc.push(color); // Ajouter la couleur si elle est unique
      }
      return acc.toSorted(); // Retourner l'accumulateur
    }, []);

  const uniquesSizes = articles
    .map((ar) => ar.size)
    .reduce<string[]>((acc, size) => {
      if (size && !acc.includes(size)) {
        acc.push(size);
      }
      return acc.toSorted();
    }, []);

  // const uniquesFlavors = articles
  //   .map((ar) => ar.flavor)
  //   .reduce<string[]>((acc, flavor) => {
  //     if (flavor && !acc.includes(flavor)) {
  //       acc.push(flavor);
  //     }
  //     return acc.toSorted();
  //   }, []);

  // const uniquesVolumes = articles
  //   .map((ar) => ar.volume)
  //   .reduce<string[]>((acc, volume) => {
  //     if (volume && !acc.includes(volume)) {
  //       acc.push(volume);
  //     }
  //     return acc.toSorted();
  //   }, []);

  const carts = user ? await getCartsByUserId(user?.id) : [];
  const isInCart = carts.some((cart) => cart.productShopId === productShop.id);

  // benefit
  const benefit = Number(
    Math.round((productShop.percentage! * product.price) / 100)
  );

  const beneficeAfterDiscount = applyPromotionOnProfit(
    benefit!,
    productShop.promotion!
  );

  const totalPriceAfterDiscount = product.price + beneficeAfterDiscount;

  const discountPercentage = calculateDiscountPercentage(
    productShop.price!,
    totalPriceAfterDiscount
  );

  return (
    <div
      className={`p-4 transition-all duration-500 ease-in-out lg:space-y-16 space-y-20
      ${Number(Header) === 3 ? "pt-24" : "pt-4"}
    `}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 2xl:gap-8 xl:gap-6 mx-auto max-w-7xl 
      transition-all duration-500 ease-in-out"
      >
        {/* images carousels */}
        <div className="w-full relative">
          <Suspense>
            <ImageSliderCarousel
              images={images}
              preferences={preferences}
              custom_height="70dvh"
            />
          </Suspense>
          {productShop.promotion && productShop.promotion > 0 ? (
            <span
              className="absolute top-3 left-2 px-3 py-1 bg-black/20  text-xs
          transition-all duration-500 ease-in-out
          "
              style={{
                borderRadius: preferences.buttonRadius,
              }}
            >
              <strong>{discountPercentage}%</strong> de reduction
            </span>
          ) : null}
        </div>

        {/* products infos */}
        <div
          className={`w-full flex flex-col gap-8 transition-all duration-500 ease-in-out
            
             `}
        >
          {/* brand and type */}
          <p className="w-full items-center flex gap-4 font-semibold capitalize">
            {product.brand && (
              <Link href={`/${shop.slug}/catalogues?brand=${product.brand}`}>
                <span>{capitalizeText(product.brand)}</span>
              </Link>
            )}
            {product.type && (
              <Link href={`/${shop.slug}/catalogues?type=${product.type}`}>
                <span className="opacity-70">
                  {product.category === "vetements"
                    ? capitalizeText(
                        returnDataValue(product.type, TypeClothesData)
                      )
                    : product.category === "accessoires"
                    ? capitalizeText(
                        returnDataValue(product.type, AccessoriesData)
                      )
                    : null}
                </span>
              </Link>
            )}
          </p>

          {/* name */}
          <h2 className="text-4xl font-black capitalize">
            {capitalizeText(product.name)}
          </h2>
          {/* stock and target */}
          <div className="w-full items-center flex gap-4 font-light uppercase pb-2">
            {totalQuantity > 0 && (
              <p
                className="px-4 py-1 border-2"
                style={{
                  borderRadius: preferences.buttonRadius,
                  borderColor: "dimgray",
                }}
              >
                {totalQuantity > 0 ? (
                  <span>
                    {totalQuantity.toString().padStart(2, "0")} en stock
                  </span>
                ) : (
                  <span>Rupture-de-stock</span>
                )}
              </p>
            )}
            {product.target && (
              <p
                className="px-4 py-1 border-2"
                style={{
                  borderRadius: preferences.buttonRadius,
                  borderColor: "dimgray",
                }}
              >
                {returnDataValue(product.target, TargetData)}
              </p>
            )}
          </div>

          {/* separators */}
          {
            <div
              style={{ backgroundColor: "dimgray" }}
              className="w-full h-[1px] opacity-75 "
            />
          }
          {/* price */}
          <div className="w-full items-center flex gap-4 font-light uppercase">
            {productShop.promotion && productShop.promotion > 0 ? (
              <div className="w-full flex item-center justify-start gap-6">
                <p className="tabular-nums font-light text-xl">
                  {returnFormatedMoney(totalPriceAfterDiscount * exchange)}
                  <span className="text-xs ml-1">{currency}</span>
                </p>
                <p className="tabular-nums font-light opacity-75">
                  <s> {returnFormatedMoney(productShop.price * exchange)}</s>
                  <span className="text-xs ml-1">{currency}</span>
                </p>
              </div>
            ) : (
              <p className="tabular-nums font-light text-xl">
                {returnFormatedMoney(productShop.price * exchange)}
                <span className="text-xs ml-1">{currency}</span>
              </p>
            )}
          </div>

          {/* separators */}
          {uniqueColors.length > 0 && uniqueColors[0] !== "nothing" && (
            <div
              style={{ backgroundColor: "dimgray" }}
              className="w-full h-[1px] opacity-75 "
            />
          )}
          {/* colors */}
          {uniqueColors.length > 0 && uniqueColors[0] !== "nothing" && (
            <div className="w-full flex gap-3 flex-col">
              <h3 className="font-semibold uppercase">Couleurs</h3>
              <div className="flex w-full flex-wrap gap-4">
                {/* basic colors */}
                {uniqueColors
                  .filter((x) => !(x === "other" || x === "multicolor"))
                  .map((color) => (
                    <UniqueColorsWithTooltip color={color} key={color} />
                  ))}
                {/* other and multicolor */}
                {uniqueColors
                  .filter((x) => x === "other" || x === "multicolor")
                  .map((color) => (
                    <div
                      key={color}
                      className={` flex items-center justify-center border-2 
                    ${
                      color === "other" || color === "multicolor"
                        ? "px-1"
                        : "w-6  border-gray-200"
                    }`}
                    >
                      <span className="text-xs font-light uppercase">
                        {returnDataValue(color, ColorsData)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* separators */}
          {uniquesSizes.length > 0 && Number(uniquesSizes[0]) !== 0 && (
            <div
              style={{ backgroundColor: "dimgray" }}
              className="w-full h-[1px] opacity-75 "
            />
          )}

          {/* size */}
          {uniquesSizes.length > 0 && Number(uniquesSizes[0]) !== 0 && (
            <div className="w-full flex gap-3 flex-col">
              <h3 className="font-semibold uppercase">
                Tailles {shop.category === "cosmetiques" ? "(cm)" : null}
              </h3>
              <div className="flex w-full flex-wrap gap-4">
                {uniquesSizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center justify-center border-2 w-auto  border-gray-200 p-1"
                  >
                    <span className="text-xs font-light uppercase">{size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* separators */}
          {/* {uniquesVolumes.length > 0 && (
            <div
              style={{ backgroundColor: "dimgray" }}
              className="w-full h-[1px] opacity-75 "
            />
          )} */}

          {/* volume */}
          {/* {uniquesVolumes.length > 0 && (
            <div className="w-full flex gap-3 flex-col">
              <h3 className="font-semibold uppercase">
                Volumes {shop.category === "cosmetiques" ? "(ml)" : null}
              </h3>
              <div className="flex w-full flex-wrap gap-4">
                {uniquesVolumes.map((volume) => (
                  <div
                    key={volume}
                    className="flex items-center justify-center border-2 w-auto  border-gray-200 p-1"
                  >
                    <span className="text-xs font-light uppercase">
                      {volume}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* separators */}
          {/* {uniquesFlavors.length > 0 && (
            <div
              style={{ backgroundColor: "dimgray" }}
              className="w-full h-[1px] opacity-75 "
            />
          )} */}

          {/* flavor */}
          {/* {uniquesFlavors.length > 0 && (
            <div className="w-full flex gap-3 flex-col">
              <h3 className="font-semibold uppercase">Saveurs</h3>
              <div className="flex w-full flex-wrap gap-4">
                {uniquesFlavors.map((flavor) => (
                  <div
                    key={flavor}
                    className="flex items-center justify-center border-2 w-auto  border-gray-200 p-1"
                  >
                    <span className="text-xs font-light uppercase">
                      {flavor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* separators */}
          {
            <div
              style={{ backgroundColor: "dimgray" }}
              className="w-full h-[1px] opacity-75 "
            />
          }
          {/* state && qualité material*/}
          <div className="w-full items-center flex gap-4 font-light uppercase pb-2">
            {/* material */}
            {product.category === "accessoires" && product.material && (
              <p
                className="px-2 text-sm py-1 border-2"
                style={{
                  borderRadius: preferences.buttonRadius,
                  borderColor: "dimgray",
                }}
              >
                {returnDataValue(product.material, MaterialsAccData)}
              </p>
            )}
            <p
              className="px-2 text-sm py-1 border-2"
              style={{
                borderRadius: preferences.buttonRadius,
                borderColor: "dimgray",
              }}
            >
              {returnDataValue(product.quality, QualitiesData)}
            </p>

            {product.state && (
              <p
                className="px-2 text-sm py-1 border-2"
                style={{
                  borderRadius: preferences.buttonRadius,
                  borderColor: "dimgray",
                }}
              >
                {returnDataValue(product.state, StatesData)}
              </p>
            )}
          </div>

          {/* separators */}

          <div
            style={{ backgroundColor: "dimgray" }}
            className="w-full h-[1px] opacity-75 "
          />

          {/* desc */}
          <div className="w-full text-justify">
            <h3 className="font-semibold uppercase">Description</h3>
            <p className="font-light">{product.description}</p>
          </div>

          {/* separators no bg */}
          <div style={{}} className="w-full h-[1px] opacity-75 " />

          {/* cart */}
          {isUserShopBanned ? (
            <p className="text-center opacity-75">
              Cette boutique est indisponible pour le moment
            </p>
          ) : isUserBanned ? (
            <p className="text-center opacity-75">
              Vous avez été banni, pour de raison de securité
            </p>
          ) : (
            <div className="mt-2 w-full">
              {articles.length > 0 ? (
                <AddToCartButton
                  preferences={preferences}
                  product={product}
                  shop={shop}
                  productShop={productShop}
                  isInShop={isInShop}
                  images={images}
                  articles={articles}
                  carts={carts}
                  isInCart={isInCart}
                  totalPriceAfterDiscount={totalPriceAfterDiscount}
                  currency={currency}
                  exchange={exchange}
                />
              ) : (
                <p className="text-center text-sm font-light">
                  {`Ce produit n'est pas disponible pour l'achat`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* products similar */}
      <Suspense>
        <SimilarProductsComponent
          preferences={preferences}
          productsShop={productsShop}
          shop={shop}
          product={product}
          products={products}
          currency={currency}
          exchange={exchange}
        />
      </Suspense>
    </div>
  );
};

export default page;
