"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Globe2,
  Truck,
  Store,
  Handshake,
  Shield,
} from "lucide-react";

export default function APropos() {
  return (
    <main className="space-y-12 w-full max-w-4xl mx-auto py-6">
      {/* Intro */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Bienvenue sur <span className="text-blue-600">Otekis</span>
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Otekis est un service du groupe <strong>Servi Group</strong>, dédié à
          la simplification du commerce en ligne. Nous offrons une plateforme
          complète permettant à chacun de vendre, d’acheter et de gérer une
          boutique en ligne — facilement, gratuitement, et sans contrainte
          logistique.
        </p>
      </section>

      <Separator />

      {/* Notre mission */}
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Globe2 className="text-blue-600 h-6 w-6" />
              <h3 className="text-xl font-semibold">Notre mission</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Nous croyons que tout le monde mérite l’opportunité d’entreprendre
              en ligne. Notre mission est de rendre le e-commerce accessible à
              tous, sans barrière technique ni financière, tout en garantissant
              une expérience fluide et professionnelle pour les vendeurs comme
              pour les clients.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="text-blue-600 h-6 w-6" />
              <h3 className="text-xl font-semibold">Notre vision</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Devenir la première plateforme e-commerce collaborative où chaque
              vendeur peut créer son univers, partager ses produits et bâtir une
              marque forte — le tout en bénéficiant du soutien logistique et
              technologique d’Otekis.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Fonctionnement */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Store className="text-blue-600 h-5 w-5" /> Comment ça fonctionne ?
        </h3>
        <p className="text-gray-600 leading-relaxed">
          En quelques clics, vous pouvez créer votre propre boutique, choisir
          parmi nos produits disponibles, fixer vos prix et commencer à vendre.
          Chaque boutique est une entité indépendante, avec ses propres règles,
          identité et stratégie — mais toutes bénéficient de l’infrastructure
          d’Otekis.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="border-blue-100 shadow-none">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <Store className="h-8 w-8 text-blue-600" />
              <h4 className="font-semibold">Créez votre boutique</h4>
              <p className="text-sm text-gray-500">
                Ouvrez votre espace de vente personnalisé en quelques minutes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-none">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <Handshake className="h-8 w-8 text-blue-600" />
              <h4 className="font-semibold">Vendez librement</h4>
              <p className="text-sm text-gray-500">
                Fixez vos prix au-dessus du prix minimum et gagnez la différence
                sur chaque vente.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-none">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <h4 className="font-semibold">Livraison simplifiée</h4>
              <p className="text-sm text-gray-500">
                La logistique est gérée par Otekis et ses partenaires pour une
                expérience sans stress.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Nos valeurs */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="text-blue-600 h-5 w-5" /> Nos valeurs
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>Transparence :</strong> des règles claires et un système
            équitable pour chaque vendeur.
          </li>
          <li>
            <strong>Innovation :</strong> une technologie pensée pour simplifier
            le commerce.
          </li>
          <li>
            <strong>Responsabilité :</strong> chaque boutique est libre mais
            tenue de respecter nos CGU et notre contrat vendeur.
          </li>
          <li>
            <strong>Proximité :</strong> un accompagnement humain à chaque
            étape.
          </li>
        </ul>
      </section>

      <Separator />

      {/* Conclusion */}
      <section className="text-center space-y-3">
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Rejoignez dès aujourd’hui <strong>Otekis</strong> et faites partie
          d’une nouvelle génération de vendeurs en ligne. Créez, vendez, et
          grandissez — nous nous occupons du reste.
        </p>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Servi Group — Tous droits réservés.
        </p>
      </section>
    </main>
  );
}
