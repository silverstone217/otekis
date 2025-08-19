"use client";

import { DocumentationPagination } from "@/components/docs/DocumentationPagination";
import { Alert } from "@/components/ui/alert";
import { LinksDocumentation } from "@/utils/documentation";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function GestionBoutiquePage() {
  const currentUrl = usePathname();

  return (
    <div className="max-w-4xl mx-auto  xl:px-8 pb-8 space-y-16">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold">
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
            populaire en RDC) et nom du titulaire du compte. Ces informations
            seront utilisées pour déposer automatiquement les bénéfices de la
            boutique selon le calendrier de paiement défini.
          </li>
        </ul>
        <Alert className="max-w-md mx-auto flex items-start gap-3 p-4 bg-yellow-50 border-yellow-300 rounded-md">
          <TriangleAlert className="w-6 h-6 text-yellow-600 shrink-0" />
          <p className="text-yellow-800">
            Il est important de s’assurer que les informations fournies sont
            exactes et à jour, afin d’éviter tout retard ou échec de transfert.
          </p>
        </Alert>

        {/* Gestion multi-boutiques */}
        <div className="mt-6 space-y-4">
          <h4 className="font-medium">Gestion multi-boutiques</h4>
          <p>
            Un même compte utilisateur peut créer et gérer plusieurs boutiques
            sur la plateforme. Chaque boutique peut avoir :
          </p>{" "}
          <ul className="list-disc list-inside space-y-1 text-gray-700 ">
            <li>Une catégorie de produits différente</li>
            <li>
              Un nom, une description, et une image de couverture personnalisés
            </li>
            <li>Des produits, commandes, et statistiques propres</li>
          </ul>
          <p>
            Toutes les boutiques associées à un compte sont regroupées dans
            l’onglet{" "}
            <strong>
              <em>Mes boutiques</em>
            </strong>
            , accessible depuis le tableau de bord du vendeur
          </p>
          <p>
            Cela permet aux vendeurs de diversifier leurs activités, par exemple
            en séparant une boutique de vêtements d’une boutique d’accessoires
            électroniques.
          </p>
        </div>

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
          La modification d’une boutique se fait directement depuis l’interface{" "}
          <strong>
            <em>Ma boutique</em>
          </strong>
          .Le vendeur peut accéder à ses boutiques via l’onglet{" "}
          <strong>
            {" "}
            <em>Ma boutique</em>
          </strong>{" "}
          dans son tableau de bord. En cliquant sur l’une des boutiques listées,
          une page de gestion s’ouvre, permettant de modifier toutes les
          informations liées à cette boutique :
        </p>

        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Nom de la boutique </li>
          <li>Image de couverture</li>
          <li>Description</li>
          <li>Catégorie</li>
          <li>Informations de paiement</li>
        </ul>

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

        {/* <p className="mt-6">
          Ajout des produits Une fois la boutique créée, l’étape suivante
          consiste à ajouter des produits à vendre. Les produits disponibles
          dépendent de la catégorie choisie lors de la création de la boutique.
        </p> */}
      </section>

      {/* nav */}
      <DocumentationPagination
        currentUrl={currentUrl}
        links={LinksDocumentation}
      />
    </div>
  );
}
