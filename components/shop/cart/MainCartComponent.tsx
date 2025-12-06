"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ColorsData } from "@/utils/dataAdd";
import {
  applyPromotionOnProfit,
  // calculateDiscountPercentage,
  returnDataValue,
  returnFormatedMoney,
} from "@/utils/functions";
import { addToCart, deleteItemToCart } from "@/actions/shopActions";
import {
  Article,
  Cart,
  DeliveryCompany,
  Preferences,
  Product,
  ProductShop,
  Shop,
  User,
} from "@prisma/client";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import PaymentSheetComponent from "./PaymentSheetComponent";
import { SuccessModal } from "./SuccessModal";

type CombinedItem = {
  quantity: number;
  price: number;
  productShopId: string;
  cartId: string; // Renommé pour plus de clarté
  productShop: ProductShop;
  articleId: string;
};

type ProductWthArticle = Product & {
  Article: Article[];
};

type Props = {
  shop: Shop;
  products: ProductWthArticle[];
  shopPreferences: Preferences;
  productsShop: ProductShop[];
  carts: Cart[];
  isUserShopBanned: boolean;
  isUserBanned: boolean;
  currency: "$" | "CDF";
  exchange: number;
  deliveryService: DeliveryCompany[];
  exchangeValue: number;
  cinetPayPercentage: number;
  user: Omit<User, "password">;
};

const MainCartComponent = ({
  shop,
  products,
  shopPreferences,
  productsShop,
  carts,
  isUserShopBanned,
  isUserBanned,
  currency,
  exchange,
  deliveryService,
  exchangeValue,
  cinetPayPercentage,
  user,
}: Props) => {
  // Création du tableau combiné
  const combinedItems: CombinedItem[] = carts.map((cartItem) => {
    const product = productsShop.find((p) => p.id === cartItem.productShopId);

    return {
      quantity: cartItem.quantity,
      price: product ? product.price : 0, // Si le produit n'existe pas, prix par défaut à 0
      productShopId: cartItem.productShopId,
      cartId: cartItem.id,
      productShop: product as ProductShop,
      articleId: cartItem.articleId,
    };
  });

  // disabled buttton
  const [isBuying, setIsBuying] = useState(false);

  // modal success
  const [modalOpen, setModalOpen] = useState(false);

  // HEADER NUM POSITION
  const Header = shopPreferences?.Header ?? "0";

  // Calculer le prix total
  const totalPrice = combinedItems.reduce((total, item) => {
    const productShop = item.productShop;

    const product = products.find((p) => p.id === productShop.productId);

    const benefit = Number(
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      Math.round((productShop?.percentage * product?.price!) / 100)
    );

    const beneficeAfterDiscount = applyPromotionOnProfit(
      benefit,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      productShop?.promotion!
    );

    const totalPriceAfterDiscount = product
      ? product.price + beneficeAfterDiscount
      : 0;
    const totalTotalPriceAfterDiscount =
      totalPriceAfterDiscount * item.quantity;
    const totalPrice = item.price * item.quantity;

    return (
      total +
      (productShop.promotion && productShop.promotion > 0
        ? totalTotalPriceAfterDiscount * exchange
        : totalPrice * exchange)
    );
  }, 0);

  // console.log(combinedItems); // Affiche le tableau combiné
  // console.log(`Total Price: ${totalPrice}`);

  const leftAvailableProducts = combinedItems.flatMap((combinedItem) => {
    const product = products.find(
      (pr) => pr.id === combinedItem.productShop.productId
    );

    // Vérifiez si le produit existe
    if (!product) {
      return []; // Si le produit n'existe pas, retourner un tableau vide
    }

    // Filtrer les articles dont le stock est supérieur à 0
    const availableArticles = product.Article.filter(
      (ar) => ar.stock > 0 && combinedItem.articleId === ar.id
    );

    return availableArticles; // Retourner les articles disponibles
  });

  // console.log({ leftAvailableProducts });

  if (carts.length < 1) {
    return (
      <div className="px-2">
        <div className="flex items-center justify-center h-[45dvh] flex-col gap-6">
          <div className="text-center text-3xl font-bold">
            Votre panier est vide.
          </div>
          <Link href={`/${shop.slug}/catalogues`}>Voire le catalogue</Link>
        </div>
      </div>
    );
  }

  const ArticlesToBuy = () => {
    return carts
      .map((cart) => {
        // get product
        const product = products.find((prod) =>
          prod.Article.some((art) => art.id === cart.articleId)
        );
        if (!product) return null;

        // get article
        const article = product.Article.find(
          (art) => art.id === cart.articleId
        );
        if (!article) return null;

        // get product from the shop
        const productShop = productsShop.find(
          (sp) => sp.productId === product.id
        );
        if (!productShop) return null;

        const quantity = cart.quantity ?? 1;

        // benefit
        const benefit = Math.round(
          (productShop.percentage * product.price) / 100
        );

        const beneficeAfterDiscount = applyPromotionOnProfit(
          benefit,
          productShop.promotion!
        );

        const totalPriceAfterDiscount = product.price + beneficeAfterDiscount;
        const totalTotalPriceAfterDiscount = totalPriceAfterDiscount * quantity;

        const totalPrice = productShop.price * quantity;

        return {
          productId: product.id,
          articleId: article.id,
          quantity,
          MinPrice: product.price,
          totalPriceAfterDiscount,
          totalTotalPriceAfterDiscount,
          totalPrice,
          uniquePrice: productShop.price,
          productName: product.name,
          productColor: article.color,
          productSize: article.size,
          productImage: product.image,
        };
      })
      .filter((item) => item !== null); // enlève les nulls
  };

  // console.table(ArtticlesToBuy());

  // delivery price
  const deliveryPrice = 0 * exchange;

  return (
    <div
      className={`w-full flex flex-col gap-6 px-2 lg:px-4 mx-auto max-w-7xl
      ${Number(Header) === 3 ? "pt-20" : "pt-4"}
    `}
    >
      {/* header */}
      <div></div>

      {/* products list and form payment */}
      <div className="w-full lg:grid grid-cols-1 lg:grid-cols-5 gap-6 space-y-6 lg:space-y-0">
        {/* products */}
        <div
          style={{ borderRadius: shopPreferences.buttonRadius }}
          className="w-full flex flex-col lg:col-span-3 bg-overlay3 space-y-4 px-4 py-6"
        >
          {/* top text */}
          <div className="w-full flex item-center justify-between text-xl font-bold">
            <h2>Panier</h2>
            <h2>
              {leftAvailableProducts.length}{" "}
              {leftAvailableProducts.length > 1 ? "Articles" : "Article"}
            </h2>
          </div>

          {/* separators */}
          <div
            style={{ backgroundColor: "dimgray" }}
            className="h-[0.5px] w-full opacity-50"
          ></div>

          {/* products */}
          <div className="w-full flex flex-col gap-6">
            {/* cart items */}
            {carts.map((cart, index) => (
              <CartItemProduct
                key={index}
                shop={shop}
                products={products}
                shopPreferences={shopPreferences}
                productsShop={productsShop}
                cart={cart}
                currency={currency}
                exchange={exchange}
              />
            ))}
          </div>
        </div>

        {/* form payment */}
        <div
          style={{ borderRadius: shopPreferences.buttonRadius }}
          className="w-full col-span-2  bg-black/20 space-y-4 px-4 py-6"
        >
          {/* top text */}
          <div className="w-full flex item-center justify-between text-xl font-bold">
            <h2>Resumée de la commande</h2>
          </div>

          {/* separators */}
          <div
            style={{ backgroundColor: "dimgray" }}
            className="h-[0.5px] w-full opacity-50"
          ></div>

          {/* TVA */}
          <div className="w-full flex item-center justify-between text-sm">
            <Label className="opacity-75">TVA</Label>
            <p className="opacity-75 font-semibold tabular-nums ">
              15% de tva appliquée
            </p>
          </div>

          {/* delivery price */}
          <div className="w-full flex item-center justify-between text-sm">
            <Label className="opacity-75">Frais de livraison</Label>
            <p className="opacity-75 font-semibold tabular-nums">
              {/* {returnFormatedMoney(deliveryPrice)}{" "}
              <span className="text-xs"> {currency}</span> */}
              non-defini
            </p>
          </div>

          {/* total price */}
          <div className="w-full flex item-center justify-between">
            <Label className="opacity-75">Prix total</Label>
            <p className="opacity-75 font-semibold tabular-nums">
              {returnFormatedMoney(totalPrice)}{" "}
              <span className="text-xs"> {currency}</span>
            </p>
          </div>

          {/* separators */}
          <div
            style={{ backgroundColor: "dimgray" }}
            className="h-[0.5px] w-full opacity-50"
          ></div>

          {/* payment */}
          {isUserShopBanned ? (
            <p className="text-center opacity-75">
              Cette boutique est indisponible pour le moment
            </p>
          ) : isUserBanned ? (
            <p className="text-center opacity-75">
              Vous avez été banni, pour de raison de securité
            </p>
          ) : (
            //         <button
            //           type="button"
            //           className="w-full flex items-center justify-center gap-4 mt-6 py-3 hover:opacity-75
            // transition-all duration-500 ease-in-out hover:shadow-2xl shadow-md
            // "
            //           style={{
            //             backgroundColor: shopPreferences.buttonColor,
            //             color: shopPreferences.buttonTextColor,
            //             borderRadius: shopPreferences.buttonRadius,
            //           }}
            //         >
            //           <span>Payer</span>
            //           <CreditCard className="w-8 h-8 ml-2" />
            //         </button>

            <PaymentSheetComponent
              carts={carts}
              isUserBanned={isUserBanned}
              isUserShopBanned={isUserShopBanned}
              productsShop={productsShop}
              shop={shop}
              shopPreferences={shopPreferences}
              totalPrice={totalPrice}
              ArticlesToBuy={ArticlesToBuy()}
              deliveryPrice={deliveryPrice}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              currency={currency}
              exchange={exchange}
              exchangeValue={exchangeValue}
              deliveryService={deliveryService}
              cinetPayPercentage={cinetPayPercentage}
              isBuying={isBuying}
              setIsBuying={setIsBuying}
              user={user}
            />
          )}
        </div>
      </div>

      <SuccessModal open={modalOpen} onOpenChange={setModalOpen} shop={shop} />
    </div>
  );
};

type CartItemProductType = {
  shop: Shop;
  products: ProductWthArticle[];
  shopPreferences: Preferences;
  productsShop: ProductShop[];
  cart: Cart;
  currency: "$" | "CDF";
  exchange: number;
};

const CartItemProduct = ({
  shop,
  products,
  productsShop,
  cart,
  currency,
  exchange,
}: CartItemProductType) => {
  const product = products.find((prod) =>
    prod.Article.some((art) => art.id === cart.articleId)
  );

  const [quantity, setQuantity] = useState(cart.quantity ?? 1);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //   const finalQuantity = useMemo(() => cart.quantity, [cart]);

  if (!product) return null;

  const article = product.Article.find((art) => art.id === cart.articleId);
  if (!article) return <div>No Article</div>;
  const productShop = productsShop.find((sp) => sp.productId === product.id);

  // benefit
  const benefit = Number(
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    Math.round((productShop?.percentage! * product.price) / 100)
  );

  const beneficeAfterDiscount = applyPromotionOnProfit(
    benefit,
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    productShop?.promotion!
  );

  const totalPriceAfterDiscount = product.price + beneficeAfterDiscount;
  const totalTotalPriceAfterDiscount = totalPriceAfterDiscount * quantity;

  // const discountPercentage = calculateDiscountPercentage(
  //   productShop?.price!,
  //   totalPriceAfterDiscount
  // );

  const stockMax = article.stock;
  const totalPrice = productShop!.price * quantity;

  const navigateToProduct = () => {
    router.push(`/${shop.slug}/catalogues/${product.id}`);
  };

  const handleUpdateToCart = async (quant: number) => {
    setLoading(true);

    try {
      const formData = {
        productShopId: productShop!.id,
        articleId: article.id,
        quantity: quant,
        cartId: cart.id,
      };

      const cartData = await addToCart({ ...formData });

      if (cartData.error) {
        toast.error("Erreur", {
          description: cartData.message,
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

  const handleDelete = async () => {
    setLoading(true);

    try {
      const delItem = await deleteItemToCart(cart.id);
      if (delItem.error) {
        toast.error("Erreur", {
          description: delItem.message,
        });
        return;
      }
      toast.success("Article supprimé", {
        description: "Cet article a été supprimé de votre panier!",
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
  // console.log({ size: article.size, stock: article.stock });

  return (
    <div
      className="w-full grid grid-cols-2 md:grid-cols-3  overflow-hidden lg:gap-6 gap-4 text-sm
    transition-all duration-500 ease-in-out
    "
    >
      {/* image */}
      <div
        role="button"
        onClick={navigateToProduct}
        className="w-full overflow-hidden h-20 lg:h-24"
      >
        <Image
          className="w-full h-full object-cover hover:brightness-75
          transition-all duration-500 ease-in-out"
          src={product.image}
          alt={product.name}
          width={500}
          height={500}
          priority
          style={{
            borderRadius: "5px",
          }}
          unoptimized
        />
      </div>
      {/* infos */}
      <div
        className="w-full flex flex-col capitalize transition-all 
        duration-500 ease-in-out
        "
      >
        <h3
          role="button"
          onClick={navigateToProduct}
          className="line-clamp-2 capitalize font-bold text-pretty  
          transition-all duration-500 ease-in-out hover:opacity-70"
        >
          {product.name}
        </h3>
        <p className="flex item-center w-full gap-2 text-xs">
          <span className="uppercase">
            {Number(article.size) === 0 ? "" : article.size}
          </span>
          <span>
            {article.color === "nothing"
              ? ""
              : returnDataValue(article.color!, ColorsData)}
          </span>
        </p>
        {/* price */}
        {productShop?.promotion &&
        productShop.promotion > 0 &&
        totalTotalPriceAfterDiscount * exchange !==
          productShop.price * exchange ? (
          <div
            className="w-full flex gap-2 item-center justify-start 
          place-items-center"
          >
            <p className="font-semibold opacity-75">
              {returnFormatedMoney(totalTotalPriceAfterDiscount * exchange)}{" "}
              <span className="text-xs"> {currency}</span>
            </p>
            <p className=" opacity-75 text-xs">
              <s> {returnFormatedMoney(totalPrice * exchange)}</s>{" "}
              <span className="text-xs"> {currency}</span>{" "}
            </p>
          </div>
        ) : (
          <p className="font-semibold opacity-75">
            {returnFormatedMoney(totalPrice * exchange)}{" "}
            <span className="text-xs"> {currency}</span>{" "}
          </p>
        )}
        <span
          role="button"
          className="opacity-75 hover:opacity-50 my-1 cursor-pointer"
          onClick={handleDelete}
        >
          Supprimer
        </span>
      </div>

      {/* quantity */}
      {article.stock > 0 ? (
        <div className="w-full flex flex-col gap-2">
          {/* stock count-+ */}
          <div className="grid grid-cols-3 gap-2">
            <span
              role="button"
              onClick={() => {
                if (!loading && quantity === 1) {
                  handleDelete();
                  return;
                }
                if (!loading) {
                  setQuantity(Math.max(1, Number(quantity) - 1));
                  const qt = Math.max(1, Number(quantity) - 1);
                  if (qt === cart.quantity) return;

                  handleUpdateToCart(qt);
                }
              }}
              className={cn(
                `px-1 py-0.5 rounded hover:bg-overlay4 h-8
                text-white flex items-center justify-center bg-black`,
                article || stockMax < 1 ? "opacity-100" : "opacity-50"
              )}
            >
              <Minus className="w-8 flex-shrink-0" />
            </span>
            <p
              className=" font-bold px-2 py-1 border h-8
                  flex items-center justify-center border-gray-300 tabular-nums
                  select-none
                  "
            >
              {quantity}
            </p>
            <span
              role="button"
              onClick={() => {
                if (!loading) {
                  setQuantity(Math.min(stockMax, Number(quantity) + 1));
                  const qt = Math.min(stockMax, Number(quantity) + 1);
                  if (qt === cart.quantity) return;
                  handleUpdateToCart(qt);
                }
              }}
              className={cn(
                `px-1 py-0.5 rounded hover:bg-overlay4 h-8
                text-white flex items-center justify-center bg-black`,
                article || stockMax <= quantity ? "opacity-100" : "opacity-50"
              )}
            >
              <Plus className="w-8 flex-shrink-0" />
            </span>
          </div>

          {/* available stock */}
          <p
            className={cn(
              stockMax > quantity ? "" : "text-red-400",
              "opacity-80"
            )}
          >
            {stockMax} restantes
          </p>
        </div>
      ) : (
        <div>
          <p className="text-red-500">Stock insuffisant</p>
          <span
            role="button"
            onClick={handleDelete}
            className="opacity-75 hover:opacity-50 my-1"
          >
            Supprimer
          </span>
        </div>
      )}
    </div>
  );
};

export default MainCartComponent;
