"use client";
import { ProductWithArticle } from "@/types/data";
import React from "react";
import { ProductDataTable, Productscolumns } from "./DisplayProductsTable";

type Props = {
  products: ProductWithArticle[];
  currencySymbol: "$" | "CDF";
};

const MainTableProduct = ({ products, currencySymbol }: Props) => {
  const columns = Productscolumns(currencySymbol);

  return <ProductDataTable data={products} columns={columns} />;
};

export default MainTableProduct;
