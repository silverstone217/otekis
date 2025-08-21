import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <h1 className="text-7xl font-extrabold text-primary mb-6">404</h1>
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">Page non trouvée</h2>
      <p className="max-w-xl text-muted-foreground mb-8 text-lg">
        Cette partie de la documentation n’a pas encore été implémentée ou est
        en cours de mise à jour. Nous travaillons activement pour vous offrir un
        contenu complet et à jour.
      </p>
      <Link
        href="/documentation"
        className="inline-block rounded bg-primary px-5 py-3 font-semibold text-white hover:bg-primary/90 transition"
      >
        Retour à la documentation
      </Link>
    </div>
  );
}
