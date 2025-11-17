"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      {/* Icone */}
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
        <AlertTriangle className="w-12 h-12 text-red-600" />
      </div>

      {/* Titre */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        Oups ! Erreur d&apos;authentification
      </h1>

      {/* Description */}
      <p className="text-center text-gray-600 max-w-md mb-8 text-lg md:text-xl">
        Une erreur est survenue lors de la connexion. Vérifiez votre connexion
        ou réessayez plus tard.
      </p>

      {/* Bouton */}
      <Link
        href="/"
        className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-xl shadow-lg hover:bg-gray-900 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-black/30"
      >
        Retour à l’accueil
      </Link>

      {/* Note secondaire */}
      <p className="mt-6 text-gray-400 text-sm text-center max-w-sm">
        Si le problème persiste, contactez le support technique.
      </p>
    </div>
  );
}
