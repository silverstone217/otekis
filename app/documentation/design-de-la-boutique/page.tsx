"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LinksDocumentation } from "@/utils/documentation";
import { DocumentationPagination } from "@/components/docs/DocumentationPagination";

function DesignBoutiquePage() {
  const currentUrl = usePathname();

  return (
    <div className="max-w-4xl mx-auto  xl:px-8 pb-12 space-y-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Personnalisation du design de la boutique
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-prose">
          Sur <span className="font-semibold text-primary">Otekis</span>, votre
          boutique est entièrement personnalisable afin de refléter votre
          identité et offrir une expérience unique à vos clients. Tout se
          configure facilement via l’onglet{" "}
          <strong>
            <em>Préférences</em>
          </strong>
          , où vous trouverez plusieurs options et modèles pour ajuster le style
          de votre boutique selon vos goûts.
        </p>
      </header>

      {/* Section fonctionnalités */}
      <section className="prose text-gray-700 max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-6">
          Fonctionnalités de personnalisation
        </h2>
        <ul className="list-disc list-inside space-y-4 text-lg max-w-prose">
          <li>
            <strong>Partie Header</strong> : Choisissez d’afficher soit le logo
            de votre boutique, soit uniquement son nom en texte, pour définir
            l’identité visuelle principale.
          </li>
          <li>
            <strong>Icône de menu (mobile)</strong> : Sélectionnez le style
            d’icône de menu qui s’affichera sur les smartphones, pour une
            navigation adaptée et fluide.
          </li>
          <li>
            <strong>Icône du panier</strong> : Personnalisez l’icône du panier
            selon le design qui vous convient le mieux, pour une touche
            esthétique supplémentaire.
          </li>
          <li>
            <strong>Design du menu de navigation</strong> : Choisissez parmi
            plusieurs templates variés pour le style du menu principal, afin de
            l’adapter à votre marque.
          </li>
          <li>
            <strong>Partie supérieure de présentation (Hero section)</strong> :
            Sélectionnez un template visuel distinctif pour la section d’accueil
            de la boutique, celle qui capte immédiatement l’attention des
            visiteurs.
          </li>
          <li>
            <strong>Section catégories</strong> : Personnalisez le rendu de la
            section affichant les catégories de produits, grâce à plusieurs
            modèles esthétiques disponibles.
          </li>
        </ul>
      </section>

      {/* Pagination */}
      <DocumentationPagination
        currentUrl={currentUrl ?? ""}
        links={LinksDocumentation}
      />
    </div>
  );
}

export default DesignBoutiquePage;
