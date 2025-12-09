import { Article, Product } from "@/lib/generated/prisma/client";

export type ProductsTypeWithArticles = Product & { Article: Article[] };
