"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import useSelectDefaultShop from "../SelectDefaultShop";
import { Shop } from "@/lib/generated/prisma/client";

const ListProductsView = () => {
  return <div>ListProductsView</div>;
};

export const LinkAddNewProduct = ({ shops }: { shops: Shop[] }) => {
  const [isMounted, setIsMounted] = useState(false);
  const selectDefault = useSelectDefaultShop({ shops });
  const defaultShop = useMemo(
    () => shops.find((sh) => sh.id === selectDefault),
    [shops, selectDefault],
  );
  const href = `/ma-boutique/${defaultShop?.slug}/nouveau-produit`;

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  if (!isMounted) return null;
  return (
    <Link
      href={href}
      className="w-full lg:w-fit lg:px-4 py-3 bg-primary text-center text-white font-medium border-2 border-primary 
  hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out shadow-md
  flex items-center justify-center gap-4
  "
    >
      <Plus className="w-8 flex-shrink-0" />
      <span>Ajouter des produits</span>
    </Link>
  );
};

export default ListProductsView;
