"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";

const NoUserComponent = () => {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center h-[70vh] px-4 max-w-4xl mx-auto text-center gap-6">
      <UserX className="w-16 h-16 text-gray-400 mx-auto" aria-hidden="true" />
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
        Aucun utilisateur n&apos;est connecté.
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 max-w-md mx-auto">
        Connectez-vous pour accéder à votre compte ou créez un nouveau.
      </p>
      <Button
        onClick={() => router.push("/connexion")}
        className="w-full sm:w-1/3 py-4 font-semibold"
        aria-label="Se connecter"
      >
        Connexion
      </Button>
    </main>
  );
};

export default NoUserComponent;
