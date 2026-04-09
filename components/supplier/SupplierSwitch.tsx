"use client";

import * as React from "react";
import { Package, ShoppingCart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SupplierTab = "products" | "orders" | "stats";

interface SupplierSwitchProps {
  value: SupplierTab;
  onChange: (value: SupplierTab) => void;
  className?: string;
}

const tabs: {
  key: SupplierTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "products",
    label: "Produits",
    icon: <Package className="h-4 w-4" />,
  },
  {
    key: "orders",
    label: "Commandes",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    key: "stats",
    label: "Stats",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

export const SupplierSwitch: React.FC<SupplierSwitchProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-muted p-1",
        "flex items-center",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "rounded-xl px-3 py-2.5 text-sm font-medium",
              "transition-all duration-200",
              "active:scale-[0.97]",
              isActive
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
