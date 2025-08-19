"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LinksDocumentation } from "@/utils/documentation";
import { DocumentationPagination } from "@/components/docs/DocumentationPagination";
import { Alert } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

function StatistiquesEtFinances() {
  const currentUrl = usePathname();

  return (
    <div className="max-w-4xl mx-auto xl:px-8 pb-12 space-y-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Statistiques et Finances
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-prose">
          Sur <span className="font-semibold text-primary">Otekis</span>, chaque
          vendeur bénéficie d’un espace personnalisé de suivi financier,
          accessible via l’onglet{" "}
          <strong>
            <em>Stats et bénéfices</em>
          </strong>
          . Cet outil vous permet de garder un œil précis et en temps réel sur
          la santé de votre boutique.
        </p>
      </header>

      {/* Suivi des performances */}
      <section
        id="suivi-des-performances"
        className="prose text-gray-700 max-w-none space-y-5"
      >
        <h2 className="text-2xl font-semibold mb-4">Suivi des performances</h2>
        <p>
          Dans cet onglet, vous pouvez consulter les indicateurs clés de
          l’activité de votre boutique, notamment :
        </p>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>
            Le <strong>nombre total de ventes</strong> réalisées, pour mesurer
            votre succès.
          </li>
          <li>
            Le <strong>montant total des bénéfices</strong> générés, reflétant
            votre rentabilité.
          </li>
          <li>
            Le <strong>solde disponible</strong> sur la plateforme,
            correspondant aux gains en attente de transfert vers votre compte.
          </li>
        </ul>
        <p>
          Toutes ces données sont mises à jour en temps réel pour vous offrir
          une vision claire et immédiate de votre activité commerciale.
        </p>
      </section>

      {/* Versement des bénéfices */}
      <section
        id="versement-des-benefices"
        className="prose text-gray-700 max-w-none space-y-5"
      >
        <h2 className="text-2xl font-semibold mb-4">Versement des bénéfices</h2>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>
            Les bénéfices sont transférés sur votre compte M-Pesa, renseigné
            lors de la création ou modification de votre boutique.
          </li>
          <li>
            Le transfert suit un calendrier régulier établi par{" "}
            <span className="font-semibold text-primary">Otekis</span>, par
            exemple hebdomadaire ou mensuel, pour garantir un suivi transparent.
          </li>
          <li>
            Notez que des frais de transfert peuvent s’appliquer selon les
            conditions du service M-Pesa ou la politique interne de la
            plateforme.
          </li>
        </ul>
      </section>

      {/* Alerte importante */}
      <Alert className="max-w-md mx-auto flex items-start gap-3 p-4 bg-yellow-50 border-yellow-300 rounded-md">
        <TriangleAlert className="w-6 h-6 text-yellow-600 shrink-0" />
        <p className="text-yellow-800">
          Pensez à vérifier régulièrement vos informations de paiement pour
          éviter tout retard ou incident lors des transferts de fonds.
        </p>
      </Alert>

      {/* Pagination */}
      <DocumentationPagination
        currentUrl={currentUrl ?? ""}
        links={LinksDocumentation}
      />
    </div>
  );
}

export default StatistiquesEtFinances;
