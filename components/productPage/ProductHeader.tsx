"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductHeader = () => {
  return (
    <header className="w-full bg-white dark:bg-neutral-900 border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Nos produits
          </h1>
        </div>

        <Link href="/ma-boutique/creer">
          <Button className="bg-black hover:bg-black/80 text-white gap-2 shadow-lg shadow-blue-500/20">
            <Store className="size-4" />
            <span className="hidden sm:inline">Lancer votre boutique</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default ProductHeader;
