"use client";
import {
  Article,
  Cart,
  Preferences,
  Product,
  ProductShop,
  Shop,
} from "@prisma/client";
import React, { Suspense, useMemo, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ImageSliderCarousel from "./ImageSliderCarousel";
import { Label } from "@/components/ui/label";
import { returnDataValue, returnFormatedMoney } from "@/utils/functions";
import { ColorsData } from "@/utils/dataAdd";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { addToCart, deleteItemToCart } from "@/actions/shopActions";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { SiApple } from "react-icons/si";
import { luminanceColor } from "@/utils/shopFunctions";
import { Button } from "@/components/ui/button";

type Props = {
  images: string[];
  preferences: Preferences;
  product: Product;
  shop: Shop;
  productShop: ProductShop;
  articles: Article[];
  isInShop: boolean;
  carts: Cart[];
  isInCart: boolean;
  totalPriceAfterDiscount: number;
  currency: "$" | "CDF";
  exchange: number;
};

export const providers = [
  { name: "Google", Icon: FaGoogle, enabled: true, id: "google" },
  { name: "Apple", Icon: SiApple, enabled: false, id: "apple" },
  { name: "Facebook", Icon: FaFacebookF, enabled: false, id: "facebook" },
];

const AddToCartButton = ({
  // images,
  preferences,
  product,
  productShop,
  images,
  articles,
  carts,
  shop,
  totalPriceAfterDiscount,
  exchange,
  currency,
}: Props) => {
  const [article, setArticle] = useState(
    articles.length > 0 ? articles[0].id : ""
  );

  // CHECK IF THE ITEM IS IN THE CART
  const isInCartItem = useMemo(
    () =>
      carts.find(
        (cart) =>
          cart.productShopId === productShop.id && cart.articleId === article
      ),
    [carts, productShop.id, article]
  );

  const [quantity, setQuantity] = useState(
    isInCartItem ? isInCartItem.quantity : 1
  );

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  // console.log({ isInCartItem });

  // ADD TO CART
  const handleAddToCart = async () => {
    setLoading(true);

    try {
      const formData = {
        productShopId: productShop.id,
        articleId: article,
        quantity,
        // totalPrice,
      };

      const cart = await addToCart({ ...formData });

      if (cart.error) {
        toast.error("Erreur", {
          description: cart.message,
        });
        return;
      }

      toast.success("Article ajouté", {
        description: cart.message,
      });

      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur", {
        description: err.message,
      });
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // UPDATE TO CART
  const handleUpdateToCart = async () => {
    setLoading(true);

    try {
      const formData = {
        productShopId: productShop.id,
        articleId: article,
        quantity,
        cartId: isInCartItem?.id,
      };

      const cart = await addToCart({ ...formData });

      if (cart.error) {
        toast.error("Erreur", {
          description: cart.message,
        });
        return;
      }

      toast.success("Article modifié", {
        description: "la quantité de cet article a été modifiée!",
      });

      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur", {
        description: err.message,
      });
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // REMOVE FROM CART
  const handleRemoveFromCart = async () => {
    setLoading(true);

    try {
      if (!isInCartItem) return;
      const cartId = isInCartItem?.id;
      await deleteItemToCart(cartId);

      toast.success("Article supprimé", {
        description: "cet article a été supprimé du panier!",
      });

      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur", {
        description: err.message,
      });
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // STOCK MAX
  const stockMax = useMemo(
    () => articles.find((art) => art.id === article)?.stock ?? 1,
    [article, articles]
  );

  // TOTAL PRICE
  const totalPrice = useMemo(
    () => Number(productShop.price * quantity),
    [productShop.price, quantity]
  );

  // TOTAL PRICE AFTER DISCOUNT
  const totalTotalPriceAfterDiscount = useMemo(
    () => Number(totalPriceAfterDiscount * quantity),
    [quantity, totalPriceAfterDiscount]
  );

  // HANDLE SIGN IN
  const handleSignIn = async (providerId: string) => {
    try {
      await signIn(providerId);
    } catch (error) {
      console.error(error);
    }
  };

  // LUMINANCE
  const luminance = luminanceColor(preferences.background);

  return (
    <Sheet>
      <SheetTrigger
        style={{
          backgroundColor: preferences.buttonColor,
          color: preferences.buttonTextColor,
          borderRadius: preferences.buttonRadius,
          padding: "10px 20px",
          cursor: "pointer",
        }}
        className="font-medium hover:opacity-70 hover:shadow-md transition-all 
        duration-500 ease-in-out w-full"
      >
        <span>Ajouter au panier</span>
      </SheetTrigger>
      <SheetContent
        style={{
          backgroundColor: preferences.background,
          color: preferences.textColor,
          borderColor: preferences.background,
        }}
        className="max-h-[100dvh] overflow-x-hidden overflow-y-auto w-full"
      >
        <SheetHeader
          style={{ borderColor: "dimgray" }}
          className="border-b-2 pb-4"
        >
          <SheetTitle
            style={{ color: preferences.textColor }}
            className="text-xl font-bold opacity-80 uppercase text-center text-pretty"
          >
            Ajout au panier
          </SheetTitle>
          <SheetDescription hidden>Ajouter dans le panier</SheetDescription>
        </SheetHeader>

        <div className="w-full grid gap-4 p-4">
          {/* name */}
          <h2 className="capitalize text-xl font-bold">{product.name}</h2>

          {/* images carousels */}
          <div className="w-full">
            <Suspense>
              <ImageSliderCarousel
                images={images}
                preferences={preferences}
                custom_height="30dvh"
              />
            </Suspense>
          </div>
          {/* product info */}

          {/* Article*/}
          <div className="w-full grid grid-cols-1 gap-4 mt-4">
            {/* basic colors */}
            {articles
              .filter((x) => !(x.color === "other" || x.color === "multicolor"))
              .map((art) => (
                <div
                  key={art.id}
                  role="button"
                  className={`w-full px-4 py-2 flex items-center border capitalize gap-4 group
                    hover:opacity-75
                    `}
                  style={{
                    borderRadius: preferences.buttonRadius,
                    borderColor:
                      art.id === article ? preferences.buttonColor : "dimgray",
                  }}
                  onClick={() => {
                    setArticle(art.id);
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor:
                        art.id === article
                          ? preferences.buttonColor!
                          : "transparent",
                      borderRadius: "50%",
                    }}
                    className="transition-all duration-500 ease-in-out"
                  />
                  <span
                    className={`
                   ${Number(art.size) === 0 ? "w-[150px]" : "w-[84px]"}
                    line-clamp-1`}
                  >
                    {art.color === "nothing"
                      ? "Choix unique"
                      : returnDataValue(art.color!, ColorsData)}
                  </span>
                  <span>{Number(art.size) === 0 ? "" : art.size!}</span>
                  <span className="self-end text-right flex-1 tabular-nums text-xs opacity-70 space-x-1">
                    {art.stock && art?.stock > 0 && (
                      <strong className="w-10 ">{art.stock} </strong>
                    )}
                    <span className="text-xs opacity-70 lowercase">
                      {art.stock > 1
                        ? "disponibles"
                        : art.stock === 1
                          ? "disponible"
                          : "rupture-de-stock"}{" "}
                    </span>
                  </span>
                </div>
              ))}

            {/* other colors */}
            {articles
              .filter((x) => x.color === "other" || x.color === "multicolor")
              .map((art) => (
                <div
                  key={art.id}
                  role="button"
                  className="w-full px-4 py-2 flex items-center border capitalize gap-4 group
                    hover:opacity-75
                    transition-all duration-500 ease-in-out
                    "
                  style={{
                    borderRadius: preferences.buttonRadius,
                    borderColor:
                      art.id === article ? preferences.buttonColor : "dimgray",
                  }}
                  onClick={() => {
                    setArticle(art.id);
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor:
                        art.id === article
                          ? preferences.buttonColor!
                          : "transparent",
                      borderRadius: "50%",
                    }}
                    className="transition-all duration-500 ease-in-out"
                  />
                  <span className="w-[84px] line-clamp-1">
                    {art.color === "nothing"
                      ? "nothing"
                      : returnDataValue(art.color!, ColorsData)}
                  </span>
                  <span>{Number(art.size) === 0 ? "" : art.size!}</span>
                  <span className="self-end text-right flex-1 tabular-nums text-xs opacity-70 space-x-1">
                    {art.stock && art?.stock > 0 && (
                      <strong>{art.stock} </strong>
                    )}
                    <span className="text-xs opacity-70 lowercase">
                      {art.stock > 1
                        ? "disponibles"
                        : art.stock === 1
                          ? "disponible"
                          : "rupture-de-stock"}{" "}
                    </span>
                  </span>
                </div>
              ))}
          </div>

          {/* quantity */}
          <div className="w-full flex items-center justify-between mt-4 gap-4">
            <Label className="capitalize font-medium">Quantité:</Label>
            <div className="flex item-center justify-center gap-2">
              <span
                role="button"
                onClick={() => {
                  if (article && quantity === 1 && isInCartItem) {
                    handleRemoveFromCart();
                    return;
                  }
                  if (article) {
                    setQuantity(Math.max(1, Number(quantity) - 1));
                    return;
                  }
                }}
                className={cn(
                  `px-1 py-0.5 rounded hover:bg-overlay4 
                text-white flex items-center justify-center bg-black`,
                  article || stockMax < 1 ? "opacity-100" : "opacity-50"
                )}
              >
                <Minus className="w-8 flex-shrink-0" />
              </span>
              <p
                className=" font-bold px-3 py-1 border
                  flex items-center justify-center border-gray-300 tabular-nums
                  select-none
                  "
              >
                {quantity}
              </p>
              <span
                role="button"
                onClick={() => {
                  if (article)
                    setQuantity(Math.min(stockMax, Number(quantity) + 1));
                }}
                className={cn(
                  `px-1 py-0.5 rounded hover:bg-overlay4 
                text-white flex items-center justify-center bg-black`,
                  article || stockMax <= quantity ? "opacity-100" : "opacity-50"
                )}
              >
                <Plus className="w-8 flex-shrink-0" />
              </span>
            </div>
          </div>

          {/* total price */}
          <div className="w-full flex items-center justify-between py-4 gap-4 border-y mt-4">
            <Label className="capitalize font-medium">Prix total:</Label>
            {productShop.promotion &&
            productShop.promotion > 0 &&
            productShop.price * exchange !==
              totalPriceAfterDiscount * exchange ? (
              <div className="flex item-center gap-2 px-3 py-1">
                <p
                  className="font-bold gap-1
                  flex items-center justify-center tabular-nums
                  "
                >
                  {returnFormatedMoney(totalTotalPriceAfterDiscount * exchange)}{" "}
                  <span className="text-xs"> {currency}</span>
                </p>
                <p
                  className="opacity-75 gap-1
                  flex items-center justify-center tabular-nums
                  "
                >
                  <s>{returnFormatedMoney(totalPrice * exchange)}</s>{" "}
                  <span className="text-xs"> {currency}</span>
                </p>
              </div>
            ) : (
              <p
                className="font-bold px-3 py-1 gap-1
                  flex items-center justify-center tabular-nums
                  "
              >
                {returnFormatedMoney(totalPrice * exchange)}{" "}
                <span className="text-xs"> {currency}</span>
              </p>
            )}
          </div>

          {/* add to cart button */}
          {user && !isInCartItem ? (
            <>
              {stockMax > 0 && articles.length > 0 ? (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-4 mt-6 py-3 hover:opacity-75
            transition-all duration-500 ease-in-out hover:shadow-2xl shadow-md
            "
                  style={{
                    backgroundColor: preferences.buttonColor,
                    color: preferences.buttonTextColor,
                    borderRadius: preferences.buttonRadius,
                  }}
                  onClick={() => handleAddToCart()}
                  disabled={article === null || quantity <= 0 || loading}
                >
                  <span>{loading ? "en cours..." : "Ajouter au panier"}</span>
                  {!loading && <ShoppingCart className="w-8 flex-shrink-0" />}
                </button>
              ) : (
                <div className="mt-4">
                  <p className="text-center text-xs opacity-70">
                    Stock insuffisant pour cette couleur et taille.
                  </p>
                </div>
              )}
            </>
          ) : null}

          {!user ? (
            <div className="space-y-2 mt-3">
              <p className="text-center text-sm opacity-70">
                Vous devez vous connecter pour ajouter un article au panier.
              </p>
              <p className="text-center text-sm mt-3">Continuer avec</p>

              {/* google */}
              <div className="grid grid-cols-1 gap-4 w-full">
                {providers.map(({ name, Icon, enabled, id }) => (
                  <Button
                    key={id}
                    variant={enabled ? "default" : "outline"}
                    disabled={!enabled}
                    className="flex gap-3 items-center justify-center py-3 
            text-base font-semibold hover:scale-105 transition-transform"
                    onClick={() => enabled && handleSignIn(id)}
                    style={{
                      backgroundColor: enabled
                        ? preferences.buttonColor
                        : undefined,
                      color: enabled
                        ? preferences.buttonTextColor
                        : luminance !== "dark"
                          ? "black"
                          : "white",
                      borderRadius: preferences.buttonRadius,
                      opacity: enabled ? 1 : 0.3,
                      borderColor: enabled
                        ? preferences.buttonColor
                        : luminance === "dark"
                          ? "black"
                          : "white",
                    }}
                  >
                    <Icon className="w-6 h-6" aria-hidden="true" />
                    <span>{name}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {/* modify */}
          {user && isInCartItem && quantity !== isInCartItem.quantity ? (
            <>
              {stockMax > 0 && articles.length > 0 ? (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-4 mt-6 py-3 hover:opacity-75
            transition-all duration-500 ease-in-out hover:shadow-2xl shadow-md
            "
                  style={{
                    backgroundColor: preferences.buttonColor,
                    color: preferences.buttonTextColor,
                    borderRadius: preferences.buttonRadius,
                  }}
                  onClick={() => handleUpdateToCart()}
                  disabled={article === null || quantity <= 0 || loading}
                >
                  <span>{loading ? "en cours..." : "Modifier"}</span>
                  {!loading && <ShoppingCart className="w-8 flex-shrink-0" />}
                </button>
              ) : (
                <div className="mt-4">
                  <p className="text-center text-xs opacity-70">
                    Stock insuffisant pour cette couleur et taille.
                  </p>
                </div>
              )}
            </>
          ) : null}

          {/* go the cart */}
          {user && isInCartItem ? (
            <SheetClose asChild className="mt-6">
              <Link
                href={`/${shop.slug}/panier`}
                className="w-full flex items-center justify-center gap-4  py-3 hover:opacity-75
            transition-all duration-500 ease-in-out hover:shadow-2xl shadow-md
            "
                style={{
                  borderColor: preferences.buttonColor,
                  color: preferences.textColor,
                  borderRadius: preferences.buttonRadius,
                  borderWidth: 2,
                }}
              >
                <span>Voir le panier</span>
                <ShoppingCart className="w-8 flex-shrink-0" />
              </Link>
            </SheetClose>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddToCartButton;
