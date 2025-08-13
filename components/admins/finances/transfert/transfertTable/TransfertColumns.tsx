"use client";

import { Button } from "@/components/ui/button";
import { CategoriesData } from "@/utils/data";
import { returnDataValue } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";
import { Shop } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const TransfertColumns = (currencySymbol: string): ColumnDef<Shop>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        aria-label="Trier par numéro"
      >
        N <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const index = (row.index + 1).toString().padStart(2, "0");
      return (
        <span className="text-xs font-mono text-muted-foreground">{index}</span>
      );
    },
    enableSorting: true, // Optionnel : désactive le tri sur l’index
    size: 50,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        aria-label="Trier par titre"
      >
        Boutique <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.original.name;
      return (
        <span className="line-clamp-2 text-sm font-semibold text-foreground">
          {capitalizeText(name)}
        </span>
      );
    },
    size: 300,
  },
  {
    accessorKey: "category",
    header: "Catégorie",
    cell: ({ row }) => {
      const category = row.original.category;
      const formattedCategory = returnDataValue(category, CategoriesData);
      return (
        <span className="text-xs font-medium text-muted-foreground">
          {capitalizeText(formattedCategory)}
        </span>
      );
    },
    size: 120,
  },

  {
    accessorKey: "paymentPhone",
    header: "Numero",
    cell: ({ row }) => {
      const paymentPhone = row.original.paymentPhone;
      const formattedPaymentPhone = "+243 " + paymentPhone;
      return (
        <span className="text-xs font-medium text-muted-foreground">
          {formattedPaymentPhone}
        </span>
      );
    },
    size: 120,
  },

  {
    accessorKey: "benefit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        aria-label="Trier par montant"
      >
        Montant <ArrowUpDown className="w-4 h-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const benefit =
        currencySymbol === "CDF"
          ? row.original.benefitCDF
          : row.original.benefit;
      const formattedBenefit = `${benefit
        .toString()
        .padStart(2, "0")} ${currencySymbol}`;
      return <span className="text-xs font-semibold">{formattedBenefit}</span>;
    },
    size: 120,
  },

  {
    accessorKey: "createdAt",
    header: "Créée le",
    cell: ({ row }) => {
      const formattedDate = new Date(row.original.createdAt).toLocaleDateString(
        "fr-FR",
        {
          dateStyle: "medium",
        }
      );
      return (
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      );
    },
    size: 130,
  },
];
