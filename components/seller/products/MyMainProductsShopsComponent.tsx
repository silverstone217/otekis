"use client";
import { Product, ProductShop, Shop } from "@prisma/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSelectDefaultShop from "../SelectDefaultShop";
import { getProductShopByShopId } from "@/actions/shopActions";
import ListModifyProductsShop from "./ListModifyProductsShop";
import { ProductWithArticle } from "@/types/data";
import ActionsProducts from "./ActionsProducts";
import { ShopDefaultSelect } from "../SelectWIthOptionsDefaultShop";

type Props = {
  shops: Shop[];
  products: ProductWithArticle[];
  currency: "$" | "CDF";
  exchange: number;
};

type ProductShopTypeWithProducts = ProductShop & { product: Product };

const MyMainProductsShopsComponent = ({
  shops,
  products,
  currency,
  exchange,
}: Props) => {
  //   const [products, setProducts] = useState<Product[]>([]);
  const [productsShop, setProductsShop] = useState<
    ProductShopTypeWithProducts[]
  >([]);
  const defaultShopId = useSelectDefaultShop({ shops });
  const [loading, setLoading] = useState(false);

  //   get shop
  const shop = useMemo(
    () => (defaultShopId ? shops.find((sh) => sh.id === defaultShopId) : null),
    [shops, defaultShopId]
  ); //

  //   get products for shop
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        productsShop.some((shopProduct) => shopProduct.productId === product.id)
      ),
    [productsShop, products]
  );

  const refreshData = useCallback(() => {
    const getShopProducts = async (shopId: string | null) => {
      setLoading(true);
      try {
        if (!shopId) {
          setProductsShop([]);
          return;
        }
        const shopProducts = await getProductShopByShopId(shopId);
        setProductsShop(
          shopProducts.map((shopProduct) => ({
            ...shopProduct,
            product: products.find(
              (product) => product.id === shopProduct.productId
            )!,
          }))
        );
        return;
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getShopProducts(defaultShopId);
  }, [defaultShopId, setProductsShop, products]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  // if (!productsShop.length && !loading) {
  //   return (
  //     <div className="w-full text-center pt-10 text-gray-600">
  //       <p className="lg:text-2xl text-xl font-bold">Aucun produit trouvé</p>
  //       <p>{`Essayez d'en ajouter en cliquant au bouton en haut.`}</p>
  //     </div>
  //   );
  // }
  if (!shop) {
    return <div>Pas de boutique trouvée.</div>;
  }

  return (
    <div>
      <br />
      <ShopDefaultSelect shops={shops} />
      <div className="py-4" />
      <ActionsProducts shop={shop} />
      {productsShop.length > 0 && !loading ? (
        <>
          <div className="py-4" />
          <ListModifyProductsShop
            products={filteredProducts}
            productsShop={productsShop}
            shop={shop}
            setProductsShop={setProductsShop}
            currency={currency}
            exchange={exchange}
          />
        </>
      ) : (
        <div className="w-full text-center pt-10 text-gray-600">
          <p className="lg:text-2xl text-xl font-bold">Aucun produit trouvé</p>
          <p>{`Essayez d'en ajouter en cliquant au bouton en haut.`}</p>
        </div>
      )}
    </div>
  );
};

export default MyMainProductsShopsComponent;
