"use client";

import { usePathname } from "next/navigation";
import { LinksDocumentation } from "@/utils/documentation";
import React from "react";
import { DocumentationPagination } from "@/components/docs/DocumentationPagination";
import { Alert } from "@/components/ui/alert";
import { Info } from "lucide-react";

const ProductsManagePage = () => {
  const currentUrl = usePathname();

  return (
    <div className="max-w-4xl mx-auto  xl:px-8 pb-12 space-y-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Gestion des Produits
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-prose">
          Une fois votre boutique créée, la prochaine étape essentielle est
          {`d'ajouter`} des produits à vendre. La sélection des produits
          disponibles dépend directement de la catégorie choisie lors de la
          création de votre boutique.
        </p>
      </header>

      {/* Intro */}
      <section className="prose text-gray-700 max-w-none">
        <p>
          Pour accéder à {`l'ajout`} de produits, rendez-vous dans l’onglet{" "}
          <em>
            <strong>Mes produits</strong>
          </em>{" "}
          disponible dans votre tableau de bord vendeur. Vous disposez de deux
          méthodes pour ajouter vos produits facilement et efficacement :
        </p>
      </section>

      {/* Méthodes d'ajout */}
      <section id="methods" className="space-y-12">
        {/* Ajout manuel */}
        <article id="add-manual" className="space-y-6">
          <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2 mb-4 max-w-max">
            Ajout manuel des produits
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 max-w-prose">
            <li>
              Cliquez sur le bouton <strong>Ajouter des produits</strong> situé
              en haut à droite de votre écran.
            </li>
            <li>
              Une liste de produits correspondant à la catégorie de votre
              boutique s’affichera.
            </li>
            <li>
              Sélectionnez les produits que vous souhaitez proposer à la vente.
            </li>
            <li>
              Pour chaque produit, définissez un pourcentage de bénéfice
              personnalisé.
            </li>
          </ul>

          <div className="bg-primary/10 border border-primary rounded-lg p-4 text-primary max-w-prose prose-sm mt-4">
            <p>
              <strong>Note importante :</strong> Tous les produits bénéficient
              d’un <em>prix minimum</em> fixé par Otekis. Le prix final affiché
              sur votre boutique est calculé ainsi : <br />
              <em>
                Prix final = Prix minimum + (Prix minimum × % de bénéfice
                choisi)
              </em>
              .
            </p>
            <p>
              Par exemple, si le prix minimum est 100 $ et vous choisissez 10 %
              de bénéfice : le produit sera vendu 110 $, générant un bénéfice de
              10 $ pour vous. Ce pourcentage peut être ajusté à tout moment
              individuellement.
            </p>
          </div>
        </article>

        {/* Ajout automatique */}
        <article id="add-auto" className="space-y-6">
          <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2 mb-4 max-w-max">
            Ajout automatique des produits
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 max-w-prose">
            <li>
              Choisissez d’ajouter en une seule fois tous les produits de la
              catégorie de votre boutique.
            </li>
            <li>
              Indiquez un pourcentage global de bénéfice qui sera appliqué
              uniformément à tous ces produits.
            </li>
          </ul>
          <p className="max-w-prose mt-2">
            Cette méthode est particulièrement utile pour gagner du temps
            lorsque vous gérez une boutique avec un très large catalogue.
          </p>
        </article>
      </section>

      {/* Info / astuce */}
      <Alert className="max-w-md mx-auto flex items-start gap-3 p-4">
        <Info className="w-6 h-6 flex-shrink-0 text-blue-500 mt-1" />
        <p className="text-sm text-gray-700 dark:text-gray-200">
          Vous pouvez modifier le pourcentage de bénéfice associé à vos produits
          à tout moment, depuis votre tableau de bord.
        </p>
      </Alert>

      {/* Pagination */}
      <DocumentationPagination
        currentUrl={currentUrl ?? ""}
        links={LinksDocumentation}
      />
    </div>
  );
};

export default ProductsManagePage;
