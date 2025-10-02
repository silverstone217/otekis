import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "./BackButton";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="scroll-smooth min-h-screen bg-white text-gray-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 p-4 text-sm text-gray-600">
        <BackButton />
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-500">Conditions et Termes</span>
      </div>

      <Separator />

      {/* Page Title */}
      <header className="p-4 md:p-6 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Conditions et Termes
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Veuillez lire attentivement nos conditions générales et contrats
          d’utilisation.
        </p>
      </header>

      {/* Content */}
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}

export default Layout;
