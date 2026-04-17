"use client";

import { IsAvailableProducts, IsAvailableType } from "@/utils/supplier";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { PermittedSellersSelect } from "../new/PermittedSellersSelect";
import { SelectorProducts } from "../../SelectProductCategories";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { capitalizeText } from "@/utils/shopFunctions";
import { updateDisponibility } from "@/actions/supplierAction";

type Shop = {
  id: string;
  name: string;
  logo: string;
};

type AvaiabilityType = {
  productId: string;
  isAvailable: IsAvailableType;
  permittedSellers: string[];
};

const AvaiabillityForm = ({
  productId,
  isAvailable: initialAvailable,
  permittedSellers: initialSellers,
}: AvaiabilityType) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);

  const [isAvailable, setIsAvailable] = useState<IsAvailableType>(
    initialAvailable ?? "for_all",
  );

  const [permittedSellers, setPermittedSellers] = useState<string[]>(
    initialSellers ?? [],
  );

  // 🔹 FETCH SHOPS
  useEffect(() => {
    const fetchShops = async () => {
      const res = await fetch("/api/supplier/shops-list");
      const data = await res.json();
      setShops(data);
    };

    fetchShops();
  }, []);

  // 🔹 MAP PERMITTED SHOPS
  const permittedShopsData = useMemo(() => {
    return shops.filter((shop) => permittedSellers.includes(shop.id));
  }, [shops, permittedSellers]);

  // 🔹 REMOVE SHOP
  const removeShop = (shopId: string) => {
    setPermittedSellers((prev) => prev.filter((id) => id !== shopId));
  };

  // 🔹 DIRTY CHECK
  const isDirty = useMemo(() => {
    const sameAvailability = isAvailable === initialAvailable;

    const sameList =
      permittedSellers.length === initialSellers.length &&
      permittedSellers.every((id) => initialSellers.includes(id));

    if (isAvailable === "for_all") return !sameAvailability;

    return !(sameAvailability && sameList);
  }, [isAvailable, permittedSellers, initialAvailable, initialSellers]);

  const availableShops = useMemo(() => {
    return shops.filter((shop) => !permittedSellers.includes(shop.id));
  }, [shops, permittedSellers]);

  // 🔹 UPDATE SERVER
  const handleUpdateDisponibility = async () => {
    setLoading(true);

    try {
      if (isAvailable === "specific_sellers" && permittedSellers.length === 0) {
        toast.error("Ajoutez au moins une boutique");
        return;
      }

      const payload = {
        productId,
        isAvailable,
        permittedSellers,
      };

      const result = await updateDisponibility(payload);
      if (result.error) throw new Error(result.message);

      toast.success("Disponibilité mise à jour");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-4">
      {/* HEADER */}
      <header className="space-y-1">
        <h2 className="text-xl font-medium tracking-tight">
          Disponibilité du produit
        </h2>
        <p className="text-sm text-muted-foreground">
          Définissez qui peut vendre ce produit.
        </p>
      </header>

      <div className="space-y-6">
        {/* SELECT TYPE */}
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-muted-foreground">
            Disponibilité
          </label>

          <SelectorProducts
            data={IsAvailableProducts}
            value={isAvailable}
            onChange={(val) => {
              setIsAvailable(val as IsAvailableType);
              if (val !== "specific_sellers") {
                setPermittedSellers([]);
              } else {
                setPermittedSellers(initialSellers);
              }
            }}
            disabled={loading}
            placeholder="Sélectionnez une option de disponibilité"
          />
        </div>

        {/* SPECIFIC SELLERS */}
        {isAvailable === "specific_sellers" && (
          <div className="space-y-4">
            {/* SELECT ADD */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-muted-foreground">
                Ajouter des boutiques
              </label>

              <PermittedSellersSelect
                data={availableShops}
                value={permittedSellers}
                onChange={(newList) => {
                  const unique = Array.from(new Set(newList));
                  setPermittedSellers(unique);
                }}
              />
            </div>

            {/* LIST */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Boutiques autorisées
              </p>

              {permittedShopsData.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Aucune boutique sélectionnée
                </p>
              ) : (
                <div className="space-y-2">
                  {permittedShopsData.map((shop) => (
                    <div
                      key={shop.id}
                      className="
                        flex items-center justify-between
                        p-3 rounded-xl border
                        bg-muted/30
                      "
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={shop.logo}
                          alt={capitalizeText(shop.name) + " logo"}
                          priority
                          className="h-8 w-8 rounded-full object-cover"
                          width={60}
                          height={60}
                        />
                        <span className="text-sm font-medium">
                          {capitalizeText(shop.name)}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeShop(shop.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ACTION */}
      <div className="flex items-center justify-end pt-4 border-t border-muted/40">
        <Button
          onClick={handleUpdateDisponibility}
          disabled={!isDirty || loading}
          className="px-8 h-10"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default AvaiabillityForm;
