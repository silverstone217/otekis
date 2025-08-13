"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

import { Shop } from "@prisma/client";
import { CategoriesData } from "@/utils/data";
import { returnDataValue } from "@/utils/functions";
import useSelectDefaultShop from "./SelectDefaultShop";

type Props = {
  shops: Shop[];
};

const ShopSellerList = ({ shops }: Props) => {
  const selectDefault = useSelectDefaultShop({ shops });

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {shops.map((shop) => (
        <ShopSellerCard
          key={shop.id}
          shop={shop}
          selectDefault={selectDefault}
        />
      ))}
    </div>
  );
};

type ShopSellerCardProps = {
  shop: Shop;
  selectDefault: string | null;
};

const ShopSellerCard = ({ shop, selectDefault }: ShopSellerCardProps) => {
  const router = useRouter();
  const isSelected = selectDefault === shop.id;

  const handleSelectDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem("shop", JSON.stringify(shop.id));
    toast.success("Ajout réussi !", {
      description: `${shop.name} a été choisie comme boutique par défaut`,
      duration: 3000,
    });
    router.refresh();
  };

  return (
    <Link href={`/ma-boutique/${shop.slug}`} className="group">
      <Card
        className={`flex items-center gap-4 p-4 transition-shadow border ${
          isSelected ? "border-yellow-400 shadow-lg" : "border-gray-200"
        } hover:shadow-xl`}
      >
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
          <Image
            src={shop.logo}
            alt={shop.name}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        </div>

        {/* Infos */}
        <div className="flex flex-col flex-1 min-w-0">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold truncate capitalize">
              {shop.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1 text-sm text-muted-foreground">
            <p>{returnDataValue(shop.category, CategoriesData)}</p>
            <p className="text-xs">
              Ajoutée le{" "}
              {new Date(shop.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </CardContent>
        </div>

        {/* Bouton sélection */}
        <Button
          variant={isSelected ? "destructive" : "outline"}
          size="icon"
          aria-label={
            isSelected
              ? "Boutique par défaut"
              : "Définir comme boutique par défaut"
          }
          onClick={handleSelectDefault}
          className="ml-auto rounded-full"
        >
          <Star
            className={`w-5 h-5 ${
              isSelected ? "text-yellow-400" : "text-gray-400"
            }`}
          />
        </Button>
      </Card>
    </Link>
  );
};

export default memo(ShopSellerList);
