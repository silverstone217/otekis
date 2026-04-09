"use client";
import React from "react";
import { Button } from "../ui/button";
import { NewProductDialog } from "./NewProductDialog";

const Products = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Produits</h2>
        <Button onClick={() => setOpen(true)}>Nouveau Produit</Button>
      </div>

      {/* exemple */}
      <div className="mt-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-md">
            <h3 className="text-md font-medium">Product {i}</h3>
            <p className="text-sm text-muted-foreground">
              Description for product {i}
            </p>
          </div>
        ))}
      </div>

      {/* POPUP */}
      <NewProductDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default Products;
