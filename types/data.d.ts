import { Product } from "@/lib/generated/prisma/client";
import React from "react";

export type ProductWithArticle = Product & {
  Article: Article[];
};

export type ProductCategoryType =
  | "accessoires"
  | "vetements"
  | "electroniques"
  | "aliments"
  | "cosmetiques"
  | "autres";

export type AddProductType = "self" | "auto";

export type IconLikeComponent = React.FC<{
  className?: string;
  style?: React.CSSProperties;
}>;

export type ShopCategorySellerType =
  | "all"
  | "vetements"
  | "accessoires"
  | "electroniques"
  | "aliments"
  | "cosmetiques"
  | "autres";
