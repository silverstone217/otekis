"use client";
import { siteName } from "@/utils/data";
import { capitalizeText } from "@/utils/shopFunctions";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Zap, CheckCircle, Shield } from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";
import { DocumentationPagination } from "@/components/docs/DocumentationPagination";
import { LinksDocumentation } from "@/utils/documentation";

function Page() {
  const currentUrl = usePathname();
  return (
    <div className="max-w-4xl mx-auto  xl:px-8 pb-8">
      {/* Titre */}
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">Introduction</h1>
        <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded font-semibold tracking-wide mb-2">
          {capitalizeText(siteName!)}
        </span>
      </header>

      {/* Paragraphes principaux */}
      <Card className="mb-6 p-5 bg-muted/30">
        <p className="text-lg mb-4">
          Bienvenue sur{" "}
          <span className="font-semibold text-primary">
            {capitalizeText(siteName!)}
          </span>
          , la plateforme innovante du groupe SERVI destinée à tous ceux qui
          souhaitent se lancer dans l’entrepreneuriat sans barrières financières
          ni logistiques.
        </p>
        <p>
          <span className="font-semibold text-primary">
            {capitalizeText(siteName!)}
          </span>{" "}
          a été pensée spécialement pour accompagner toute personne désirant
          démarrer un business, même sans budget de départ, sans fournisseur
          attitré ni plateformes de vente. Nous mettons à votre disposition un
          écosystème complet, prêt à {`l'emploi`}, qui vous permet de vendre des
          produits de qualité sélectionnés par nos soins, en toute simplicité et
          avec un minimum de démarches.
        </p>

        <p>
          Servi Group SARL — Société à responsabilité limitée Siège social :
          Kinshasa, RDC RCCM : CD/KNG/RCCM/25-B-00820 Identification nationale :
          01-F4300-N63754X N° d’impôt : 15/01022276M/DGI/DIRAF/DIGR/IM/2025
        </p>
      </Card>

      {/* Avantages */}
      <section className="mb-10">
        <h2 className="font-semibold text-xl mb-3">
          Grâce à notre solution, vous pouvez :
        </h2>
        <ul className="flex flex-col space-y-4">
          <li className="flex items-start gap-3">
            <ShoppingBag className="w-6 h-6 shrink-0 text-primary" />
            <span>
              <strong>Créer votre boutique en ligne en quelques minutes</strong>{" "}
              : personnalisable et accessible instantanément.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-6 h-6 shrink-0 text-yellow-500" />
            <span>
              <strong>
                Bénéficier d’un catalogue de produits variés déjà disponibles
              </strong>{" "}
              : pas besoin de stock initial, ni de recherches auprès de
              fournisseurs.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 shrink-0 text-green-600" />
            <span>
              <strong>Commencer à générer des bénéfices rapidement</strong> :
              chaque vente réalisée vous rapporte une commission sans avoir à
              avancer d’argent. Et profiter {`d'un`} système de paiement
              sécurisé.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Shield className="w-6 h-6 shrink-0 text-sky-600" />
            <span>
              <strong>
                Profiter du support et de l’accompagnement de SERVI Group
              </strong>{" "}
              : outils intuitifs, assistance dédiée, plateforme sécurisée.
            </span>
          </li>
        </ul>
      </section>

      {/* Encadré Mission */}
      <Card className="mb-6 p-5 bg-muted/50 border-l-4 border-primary">
        <p className="font-medium mb-2">
          <span className="text-primary font-semibold">
            Notre mission chez {capitalizeText(siteName!)}
          </span>
        </p>
        <p>
          <strong>Démocratiser l’accès à l’entrepreneuriat</strong> : permettre
          au plus grand nombre de démarrer une activité rentable, sans capital
          ni expérience préalable, et de grandir à leur rythme, guidés par notre
          technologie et notre réseau.
        </p>
      </Card>

      {/* Style sous-section */}
      <section>
        <p>
          Que vous soyez étudiant, salarié, commerçant indépendant ou simplement
          animé par l’envie de devenir entrepreneur,{" "}
          <span className="font-semibold text-primary">
            {capitalizeText(siteName!)}
          </span>{" "}
          <strong>
            met à votre disposition tout ce dont vous avez besoin pour réussir
          </strong>
           : des produits, une plateforme de vente clé en main, une gestion
          simplifiée et un cadre de confiance pour développer votre activité…
          tout cela, sans frein.
        </p>
      </section>

      {/* nav */}
      <DocumentationPagination
        currentUrl={currentUrl}
        links={LinksDocumentation}
      />
    </div>
  );
}

export default Page;
