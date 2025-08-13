"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusBadgeProps {
  status: string;
  onChange?: (newStatus: string) => void; // optionnel, pour rendre modifiable
  className?: string;
  type: "order" | "payment";
  disabled?: boolean;
}

const statusColorsOrder: Record<string, string> = {
  "en cours de traitement": "bg-yellow-100 text-yellow-800",
  "en attente de livraison": "bg-blue-100 text-blue-800",
  "en cours de livraison": "bg-indigo-100 text-indigo-800",
  livré: "bg-green-100 text-green-800",
  annulé: "bg-red-100 text-red-800",
  refusé: "bg-gray-300 text-gray-800",
  reporté: "bg-purple-100 text-purple-800",
  "en attente de retour": "bg-orange-100 text-orange-800",
  "en cours d'annulation": "bg-orange-100 text-orange-800",
  "en cours de retour": "bg-pink-100 text-pink-800",
  retourné: "bg-gray-300 text-gray-800",
};

const statusColorsPayment: Record<string, string> = {
  "en attente de paiement": "bg-yellow-100 text-yellow-800",
  "en cours de confirmation": "bg-indigo-100 text-indigo-800",
  payé: "bg-green-100 text-green-800",
  "en cours de remboursement": "bg-orange-100 text-orange-800",
  annulé: "bg-red-100 text-red-800",
  remboursé: "bg-purple-100 text-purple-800",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onChange,
  className,
  type = "order",
  disabled,
}) => {
  const colorClass =
    type === "order"
      ? statusColorsOrder[status.toLowerCase()] || "bg-gray-100 text-gray-800"
      : statusColorsPayment[status.toLowerCase()] ||
        "bg-gray-100 text-gray-800";

  if (onChange) {
    return (
      <Select
        value={status}
        onValueChange={async (val) => {
          await onChange(val);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={`rounded-md px-3 py-1 text-sm font-semibold ${colorClass} ${
            className ?? ""
          }`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.keys(
              type === "order" ? statusColorsOrder : statusColorsPayment
            ).map((key) => (
              <SelectItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${colorClass} ${
        className ?? ""
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
