"use client";

import Link from "next/link";
import { FileText, Home, ArrowLeft } from "lucide-react";

export default function DocsNotFound() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <div className="max-w-xl w-full text-center flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="h-8 w-8 text-gray-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight">
          Documentation en cours de rédaction
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          Cette section de la documentation n’a pas encore été complétée. Notre
          équipe travaille activement pour la rendre disponible très
          prochainement.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link
            href="/documentation"
            className="inline-flex items-center justify-center gap-2
            rounded-md border px-4 py-2 text-sm font-medium
            hover:bg-gray-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la documentation
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2
            rounded-md bg-black text-white px-4 py-2 text-sm font-medium
            hover:bg-black/90 transition"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
