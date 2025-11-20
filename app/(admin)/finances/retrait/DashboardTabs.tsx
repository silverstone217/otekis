"use client";

import { cn } from "@/lib/utils";
import { Package, Wallet } from "lucide-react";

const tabs = [
  { label: "Bénéfices", icon: Wallet },
  { label: "Livraisons", icon: Package },
];

export default function DashboardTabs({
  index,
  setIndex,
}: {
  index: number;
  setIndex: (i: number) => void;
}) {
  return (
    <div className="w-full py-4 grid grid-cols-2 gap-2">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;

        const active = index === idx;

        return (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all text-sm sm:text-base",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-all",
                active ? "opacity-100" : "opacity-70"
              )}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
