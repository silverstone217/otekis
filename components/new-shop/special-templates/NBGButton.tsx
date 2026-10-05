"use client";
import { Preferences, Shop } from "@/lib/generated/prisma/client";
import Link from "next/link";
import React from "react";

type NBGButtonProps = {
  preferences: Preferences;
  shop: Shop;
  className?: string;
};

const NBGButton = ({ preferences, shop, className }: NBGButtonProps) => {
  if (!preferences || !shop) return null;

  const { id, slug } = shop;

  if (!slug.includes("nazobetagame")) return null;

  const params = new URLSearchParams({ shopId: id, shopSlug: slug });
  const url = `/fournisseurs/nouveau-produit?${params.toString()}`;

  return (
    <Link
      href={url}
      className={className}
      style={{
        display: "inline-block",
        backgroundColor: preferences.buttonColor || "#000",
        color: preferences.buttonTextColor || "#fff",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Publier votre application
    </Link>
  );
};

export default NBGButton;
