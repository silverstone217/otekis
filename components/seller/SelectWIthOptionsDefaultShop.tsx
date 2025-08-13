"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Shop } from "@prisma/client";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { capitalizeText } from "@/utils/shopFunctions";
import { Store } from "lucide-react";

type ShopSelectProps = {
  shops: Shop[];
};

export function ShopDefaultSelect({ shops }: ShopSelectProps) {
  const router = useRouter();

  const [selected, setSelected] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("shop");
      if (stored) return JSON.parse(stored);
    }
    return shops.length > 0 ? shops[0].id : "";
  });

  useEffect(() => {
    if (!shops.length) return;
    const stored = localStorage.getItem("shop");
    if (!stored) {
      localStorage.setItem("shop", JSON.stringify(shops[0].id));
    }
  }, [shops]);

  const handleSelect = useCallback(
    (shopId: string) => {
      localStorage.setItem("shop", JSON.stringify(shopId));
      setSelected(shopId);
      const shop = shops.find((s) => s.id === shopId);
      toast.success("Boutique par défaut modifiée", {
        description: `${
          shop?.name ? capitalizeText(shop.name) : "Boutique"
        } sélectionnée`,
        duration: 2000,
      });
      router.refresh();
    },
    [shops, router]
  );

  if (!shops.length) return null;

  return (
    <div className="w-full max-w-xs">
      <label htmlFor="shop-select" className="sr-only">
        Sélectionner une boutique
      </label>
      <Select value={selected} onValueChange={handleSelect}>
        <SelectTrigger
          id="shop-select"
          className="w-full h-12 bg-white border-gray-200 rounded-lg shadow-sm focus:ring-2 
          focus:ring-indigo-500 transition"
          aria-label="Sélectionner une boutique"
        >
          <SelectValue placeholder="Choisir une boutique" />
        </SelectTrigger>
        <SelectContent>
          {shops.map((shop) => (
            <SelectItem key={shop.id} value={shop.id}>
              <div className="flex items-center gap-2">
                <Avatar className="size-7 shadow">
                  {shop.logo ? (
                    <AvatarImage src={shop.logo} alt={shop.name} />
                  ) : (
                    <AvatarFallback>
                      <Store className="w-4 h-4 text-gray-400" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="ml-2 text-sm capitalize line-clamp-1">
                  {shop.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
