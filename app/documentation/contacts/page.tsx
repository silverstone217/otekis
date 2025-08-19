"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LinksDocumentation } from "@/utils/documentation";
import { DocumentationPagination } from "@/components/docs/DocumentationPagination";

export default function ContactPage() {
  const currentUrl = usePathname();

  return (
    <div className="max-w-4xl mx-auto xl:px-8 pb-12 space-y-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Gestion des contacts de la boutique
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-prose">
          Chaque boutique sur{" "}
          <span className="font-semibold text-primary">Otekis</span> peut
          disposer de plusieurs coordonnées de contact, permettant à vos clients
          de vous joindre facilement par leurs moyens préférés.
        </p>
      </header>

      {/* Description */}
      <section className="prose text-gray-700 max-w-none space-y-6">
        <p>
          Depuis l’onglet{" "}
          <strong>
            <em>Mes Contacts</em>
          </strong>{" "}
          de votre dashboard vendeur, vous pouvez gérer et spécifier les
          différentes informations par lesquelles vos clients peuvent vous
          contacter.
        </p>
        <p>Vous avez la possibilité d’ajouter et personnaliser :</p>

        <ul className="list-disc list-inside space-y-3 text-lg max-w-prose">
          <li>Votre adresse email professionnelle.</li>
          <li>Votre ou vos numéros de téléphone.</li>
          <li>Vos comptes WhatsApp pour une communication instantanée.</li>
          <li>
            Vos profils sur les réseaux sociaux tels que Instagram, YouTube, X
            (ancien Twitter), LinkedIn, etc.
          </li>
        </ul>

        <p>
          Ces informations seront affichées dans votre boutique afin que vos
          clients puissent vous joindre facilement, renforçant ainsi la
          confiance et la qualité du service.
        </p>

        <p>
          La possibilité d’avoir des contacts différents pour chaque boutique
          vous offre une flexibilité maximale, notamment si vous gérez plusieurs
          boutiques avec des besoins distincts.
        </p>
      </section>

      {/* Pagination */}
      <DocumentationPagination
        currentUrl={currentUrl ?? ""}
        links={LinksDocumentation}
      />
    </div>
  );
}
