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
import ModifyAdditionnalImages from "./ModifyAdditionnalImages";

type Props = {
  product: SupplierProduct & {
    Article: SupplierArticle[];
    permittedShops: PermittedSeller[];
  };
};

const MainForm = ({ product }: Props) => {
  // IMAGE INFOS
  const ImageProps = { image: product.image, productId: product.id };

  // PRINCIAL INFORMATIONS
  const ProductInfo = {
    name: product.name,
    description: product.description,
    price: product.price,
    brand: product.brand,
    productId: product.id,
  };

  // CLASSIFICATION INFOS
  const ProductClassification = {
    state: product.state,
    category: product.category,
    type: product.type,
    target: product.target,
    quality: product.quality,
    productId: product.id,
  };

  // ARTICLES INFOS
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
        <ModifyAdditionnalImages
          ImageProps={{
            images: product.images,
            productId: product.id,
            productImage: product.image,
          }}
        />

        {/* Informations Principals */}
        <PrincipalsInformations ProductInfo={ProductInfo} />

        {/* INFORMATION CLASS */}
        <Classifications ProductClassification={ProductClassification} />

        {/* ARTICLES */}
        <Articles articles={ProductArticles.articles} productId={product.id} />

        {/* Address */}
        <ModifyAddress
          address={product.address}
          productId={product.id}
          contactNumber={product.contactNumber}
          paymentNumber={product.paymentNumber}
          deliveryPrice={product.deliveryPrice}
        />

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
