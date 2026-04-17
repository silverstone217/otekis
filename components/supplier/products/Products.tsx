"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Button } from "../../ui/button";
import Link from "next/link";
import { SupplierProduct } from "@/lib/generated/prisma/client";
import { capitalizeText } from "@/utils/shopFunctions";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

const Products = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SupplierProduct[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const res = await fetch("/api/supplier/products/list");
      const data = await res.json();
      setProducts(data);

      setTimeout(() => setLoading(false), 500);
    };

    getProducts();
  }, []);

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Produits</h2>
        <Link href={"/fournisseurs/nouveau-produit"}>
          <Button size={"sm"}>Nouveau Produit</Button>
        </Link>
      </div>

      {loading && (
        <div
          className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
        gap-4"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 border rounded-xl animate-pulse h-24 "
            />
          ))}
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center text-sm text-muted-foreground py-10">
          Aucun produit pour le moment
        </div>
      )}

      {/* exemple */}
      <Suspense>
        <div
          className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
        gap-4"
        >
          {products.length > 0 &&
            !loading &&
            products.map((product) => (
              <Link
                href={`/fournisseurs/produits/${product.id}`}
                key={product.id}
                className="
                group
                border rounded-xl
                p-4
                bg-background
                hover:shadow-md
                transition
                flex gap-4
              "
              >
                {/* IMAGE */}
                <div
                  className="relative w-20 h-20 rounded-lg overflow-hidden 
                border bg-muted"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* CONTENT */}
                <div className="flex-1 space-y-2">
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">
                        {capitalizeText(product.name)}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {capitalizeText(product.description)}
                      </p>
                    </div>

                    {/* STATUS */}
                    <Badge
                      className={`text-xs ${
                        product.isValidated
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {product.isValidated ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {product.isValidated ? "Validé" : "En attente"}
                    </Badge>
                  </div>

                  {/* META */}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {capitalizeText(product.category)}
                    </span>

                    {product.type && (
                      <span>• {capitalizeText(product.type)}</span>
                    )}

                    <span>• Stock: {product.stock}</span>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="font-semibold text-sm">${product.price}</p>

                    <p className="text-xs text-muted-foreground">
                      {capitalizeText(product.state)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </Suspense>
    </div>
  );
};

export default Products;
