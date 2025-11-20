"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BanknoteArrowDown, BanknoteArrowUp, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

const FinancesDataLinks = [
  { title: "Transfert", link: "/finances/transfert", icon: BanknoteArrowUp },
  { title: "Retrait", link: "/finances/retrait", icon: BanknoteArrowDown },
  { title: "Paramètres", link: "/finances/parametres", icon: Cog },
];

const FinanceNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="max-w-md mx-auto mt-4 flex w-full gap-2 px-4 sm:px-0">
      {FinancesDataLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.link;

        return (
          <Link
            key={item.link}
            href={item.link}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl",
              "font-medium text-sm sm:text-base transition-all duration-300",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-opacity",
                isActive ? "opacity-100" : "opacity-70"
              )}
            />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default FinanceNavigation;
