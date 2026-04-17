"use client";
import {
  PermittedSeller,
  SupplierArticle,
  SupplierProduct,
} from "@/lib/generated/prisma/client";
import React from "react";
import ModifyImage from "./ModifyImage";
import PrincipalsInformations from "./PrincipalsInformations";

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
      </div>
    </div>
  );
};

export default MainForm;
