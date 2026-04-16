"use client";
import { useCurrentUser } from "@/hooks/UserAuth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { UserAvatar } from "../home/Header";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const Header = () => {
  const user = useCurrentUser();

  const pathname = usePathname();

  const isAddingProduct = pathname === "/fournisseurs/nouveau-produit";

  return (
    <div className="flex items-center w-full justify-between p-4 border-b shadow">
      <Link href={isAddingProduct ? "/fournisseurs" : "/"}>
        <ArrowLeft />
      </Link>
      <h1 className={cn("text-lg  xl:text-2xl font-bold")}>
        Espace Fournisseur
      </h1>

      {user ? <UserAvatar /> : <div />}
    </div>
  );
};

export default Header;
