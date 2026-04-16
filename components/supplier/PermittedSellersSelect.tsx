"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Input } from "../ui/input";
import { capitalizeText } from "@/utils/shopFunctions";

type Seller = {
  id: string;
  name: string;
  logo: string;
};

type Props = {
  data: Seller[];
  value: string[];
  onChange: (value: string[]) => void;
};

export const PermittedSellersSelect: React.FC<Props> = ({
  data,
  value,
  onChange,
}) => {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query) return [];
    return data.filter(
      (seller) =>
        seller.name.toLowerCase().includes(query.toLowerCase()) &&
        !value.includes(seller.id),
    );
  }, [query, data, value]);

  const selected = data.filter((seller) => value.includes(seller.id));

  const handleAdd = (id: string) => {
    if (value.includes(id)) return;
    onChange([...value, id]);
    setQuery("");
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Rechercher une boutique..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full px-4 py-4
            bg-background
            text-sm
            outline-none
            focus:ring-2 focus:ring-primary/20
            transition
          "
        />

        {/* INLINE RESULTS (NO ABSOLUTE) */}
        {query && (
          <div className="rounded-xl border bg-background overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                Aucun résultat
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto">
                {filtered.map((seller) => (
                  <button
                    key={seller.id}
                    type="button"
                    onClick={() => handleAdd(seller.id)}
                    className="
                      w-full flex items-center gap-3
                      px-3 py-2
                      hover:bg-muted/50
                      transition text-left
                    "
                  >
                    <div className="relative w-8 h-8 rounded-md overflow-hidden border">
                      <Image
                        src={seller.logo}
                        alt={seller.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <span className="text-sm">
                      {capitalizeText(seller.name)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SELECTED SELLERS */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((seller) => (
            <div
              key={seller.id}
              className="
                flex items-center gap-2
                px-2.5 py-1.5
                rounded-full
                border
                bg-background
                text-sm
                shadow-sm
              "
            >
              <div className="relative w-5 h-5 rounded-sm overflow-hidden border">
                <Image
                  src={seller.logo}
                  alt={seller.name}
                  fill
                  className="object-cover"
                />
              </div>

              <span className="max-w-[120px] truncate">
                {capitalizeText(seller.name)}
              </span>

              <button
                type="button"
                onClick={() => handleRemove(seller.id)}
                className="text-muted-foreground hover:text-red-500 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
