import { Article, Product } from "@prisma/client";

export type ProductsTypeWithArticles = Product & { Article: Article[] };
