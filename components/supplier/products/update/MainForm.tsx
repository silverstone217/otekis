"use client";
import {
  PermittedSeller,
  SupplierArticle,
  SupplierProduct,
} from "@/lib/generated/prisma/client";
import React from "react";
import ModifyImage from "./ModifyImage";
import PrincipalsInformations from "./PrincipalsInformations";
import Classifications from "./Classifications";
import Articles from "./Articles";
import ModifyAddress from "./ModifyAddress";
import AvaiabillityForm from "./AvaiabillityForm";
import ProductDangerZone from "./ProductDangerZone";

type Props = {
  product: SupplierProduct & {
    Article: SupplierArticle[];
    permittedShops: PermittedSeller[];
  };
};

const MainForm = ({ product }: Props) => {
  const ImageProps = { image: product.image, productId: product.id };
  const ProductInfo = {
    name: product.name,
    description: product.description,
    price: product.price,
    brand: product.brand,
    productId: product.id,
  };

  const ProductClassification = {
    state: product.state,
    category: product.category,
    type: product.type,
    target: product.target,
    quality: product.quality,
    productId: product.id,
  };

  const ProductArticles = {
    articles: product.Article.map((a) => ({
      color: a.color,
      size: a.size,
      stock: a.stock,
      id: a.id,
    })),
    productId: product.id,
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Modify image */}
        <ModifyImage ImageProps={ImageProps} />

        {/* Modify Images(others) */}
        <div className="w-full flex flex-col gap-3">
          {/* LABEL */}
          <div>
            <p className="text-sm font-medium">Les images du produit</p>
            <p className="text-xs text-muted-foreground">
              Modifiez les image additionnelles du produit
            </p>
          </div>

          <div
            className="
            relative w-full h-64
           grid grid-cols-2 gap-4
          "
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                className=" rounded-xl overflow-hidden
            border bg-muted w-full
            "
                key={i.toString()}
              ></div>
            ))}
          </div>
        </div>

        {/* Informations Principals */}
        <PrincipalsInformations ProductInfo={ProductInfo} />

        {/* INFORMATION CLASS */}
        <Classifications ProductClassification={ProductClassification} />

        {/* ARTICLES */}
        <Articles articles={ProductArticles.articles} productId={product.id} />

        {/* Address */}
        <ModifyAddress address={product.address} productId={product.id} />

        {/* AV */}
        <AvaiabillityForm
          productId={product.id}
          permittedSellers={product.permittedShops.map((s) => s.shopId)}
          isAvailable={product.isAvailable}
        />

        {/* DANGER ZONE */}
        <ProductDangerZone
          images={[product.image, ...product.images]}
          productId={product.id}
          productName={product.name}
        />
      </div>
    </div>
  );
};

export default MainForm;
