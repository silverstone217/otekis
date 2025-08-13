import { Product } from "@prisma/client";

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
