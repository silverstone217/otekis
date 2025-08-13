"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { BanknoteArrowDown, BanknoteArrowUp, Cog } from "lucide-react";

const FinancesDataLinks = [
  {
    title: "Transfert",
    link: "/finances/transfert",
    icon: BanknoteArrowUp,
  },
  {
    title: "Retrait",
    link: "/finances/retrait",
    icon: BanknoteArrowDown,
  },
  {
    title: "Paramètres",
    link: "/finances/parametres",
    icon: Cog,
  },
];

const FinanceNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="max-w-sm mx-auto px-4 sm:px-0 items-center justify-center mt-2 sm:w-full  flex">
      {FinancesDataLinks.map((link, index) => {
        const isActive = pathname === link.link;

        return (
          <Link
            key={index}
            href={link.link}
            className={`
            p-4 flex-1 text-center font-medium text-sm sm:text-base
            ${isActive ? "text-white bg-primary" : "text-gray-500 bg-secondary"}
            hover:text-gray-400 hover:bg-primary transition-all duration-500 ease-in-out
          `}
          >
            {link.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default FinanceNavigation;
