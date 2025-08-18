"use client";

import { DocumentationPagination } from "@/components/docs/DocumentationPagination";
import { LinksDocumentation } from "@/utils/documentation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function GestionBoutiquePage() {
  const currentUrl = usePathname();

  return (
    <div className="max-w-4xl mx-auto  xl:px-8 pb-8 space-y-16">
      <header className="mb-8">
        <h1 className="text-3xl lg:text-5xl font-bold">
          Gestion de la boutique
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gérez facilement vos boutiques en ligne : création, modification,
          suivi.
        </p>
      </header>

      {/* Section Prérequis */}
      <section id="prerequis" className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Prérequis pour créer une boutique
        </h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>
            Être majeur (âge minimum 18 ans) pour encaisser les paiements.
          </li>
          <li>
            Présenter une pièce d’identité valide (carte d’identité, passeport
            ou permis de conduire).
          </li>
          <li>Disposer d’une adresse email active.</li>
          <li>Avoir un compte Mobile Money (Mpesa est recommandé).</li>
          <li>
            Connexion internet stable nécessaire pour accéder au dashboard.
          </li>
        </ul>
      </section>

      {/* Section Informations de création */}
      <section id="creation" className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Informations nécessaires pour la création
        </h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Nom unique de la boutique (obligatoire).</li>
          <li>
            Description de la boutique, pouvant servir de slogan ou message aux
            clients.
          </li>
          <li>
            Choix d’une catégorie : vêtements & chaussures, accessoires,
            cosmétiques ou appareils électroniques. Cette sélection conditionne
            les produits disponibles à la vente.
          </li>
          <li>
            Logo de la boutique : image principale obligatoire, représentative
            de votre boutique et de la plateforme.
          </li>
          <li>
            Photo de couverture (optionnelle), affichable selon votre
            préférence.
          </li>
          <li>
            Informations de paiement : compte Mpesa (le mobile money le plus
            populaire en RDC) et nom du titulaire du compte.
          </li>
          <li>
            Un utilisateur peut créer jusqu’à 3 boutiques et gérer différentes
            catégories.
          </li>
        </ul>
        <div className="mt-6">
          <Link
            href="/ma-boutique/creer"
            className="text-primary font-semibold underline hover:no-underline"
          >
            Créer maintenant une boutique &rarr;
          </Link>
        </div>
        <div className="mt-10 bg-muted/20 rounded p-4 shadow">
          <h3 className="font-semibold mb-3">Tutoriel vidéo de création</h3>
          <div className="aspect-video bg-black/10 rounded flex items-center justify-center text-muted-foreground">
            [Vidéo tutoriel création ici]
          </div>
        </div>
      </section>

      {/* Section Modification */}
      <section id="modification" className="space-y-4">
        <h2 className="text-2xl font-semibold">Modification de la boutique</h2>
        <p>
          La modification reprend les mêmes données que la création (nom,
          catégorie, description, images, paiement). Vous pouvez mettre à jour
          les informations de vos boutiques existantes à tout moment.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Modifier le nom de la boutique</h4>
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID_1"
              title="Tutoriel modification nom"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video rounded shadow"
            />
          </div>

          <div>
            <h4 className="font-medium mb-2">Changer le logo</h4>
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID_2"
              title="Tutoriel changement logo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video rounded shadow"
            />
          </div>

          {/* Ajoute d'autres tutoriels vidéo ici */}
        </div>
      </section>

      {/* nav */}
      <DocumentationPagination
        currentUrl={currentUrl}
        links={LinksDocumentation}
      />
    </div>
  );
}
