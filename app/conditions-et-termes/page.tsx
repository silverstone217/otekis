import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Store, ShoppingCart, Download } from "lucide-react";

function ConditionsAndTerms() {
  return (
    <div className="space-y-10 w-full max-w-4xl mx-auto">
      {/* SECTION 1 */}
      <Card id="ventes" className="border rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 relative">
          <Shield className="text-primary" />
          <CardTitle>Conditions Générales de Vente (CGV) – Acheteurs</CardTitle>
          <Link
            href={"../../files/Conditions Générales de Vente.pdf"}
            className="absolute right-4 top-2 flex items-center 
            gap-1 text-muted-foreground hover:text-primary"
            target="_blank"
          >
            <Download />
            <span className="sr-only">Télécharger</span>
          </Link>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="article-1">
              <AccordionTrigger>Champ d’application</AccordionTrigger>
              <AccordionContent>
                Les présentes CGV régissent les ventes de produits effectuées
                via les boutiques hébergées sur la plateforme Otekis, accessible
                à l’adresse{" "}
                <Link
                  href="https://otekis.vercel.app"
                  className="font-semibold hover:underline"
                >
                  https://otekis.vercel.app
                </Link>
                .
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="article-2">
              <AccordionTrigger>Produits proposés</AccordionTrigger>
              <AccordionContent>
                Les produits disponibles sont exclusivement fournis par Otekis.
                Aucun produit externe n’est accepté. Le stock est centralisé et
                géré par l’administrateur.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="article-3">
              <AccordionTrigger>Prix et paiement</AccordionTrigger>
              <AccordionContent>
                Le prix affiché inclut une marge fixée par le vendeur. Le
                paiement s’effectue uniquement par mobile money (M-Pesa, Airtel
                Money, Orange Money). Otekis encaisse l’intégralité du paiement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="article-4">
              <AccordionTrigger>Livraison</AccordionTrigger>
              <AccordionContent>
                Les produits sont livrés en main propre à l’acheteur. La
                livraison est assurée soit par le service interne de Otekis,
                soit par une entreprise tierce partenaire associée à Otekis.
                L’acheteur confirme la réception en présentant un code QR à
                scanner. Le suivi de commande est disponible sur le site.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="article-5">
              <AccordionTrigger>Annulation et remboursement</AccordionTrigger>
              <AccordionContent>
                L’acheteur peut annuler sa commande{" "}
                <strong>avant que le livreur récupère le produit</strong>. Passé
                cette étape, aucun remboursement n’est possible. En cas
                d’annulation, des frais liés au transfert mobile peuvent être
                prélevés.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="article-6">
              <AccordionTrigger>Service client</AccordionTrigger>
              <AccordionContent>
                Toute réclamation peut être adressée via le formulaire de
                contact sur le site. Otekis s’engage à répondre dans un délai
                raisonnable.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="article-7">
              <AccordionTrigger>Droit applicable</AccordionTrigger>
              <AccordionContent>
                Les présentes CGV sont régies par le droit congolais. En cas de
                litige, les juridictions compétentes sont celles du siège social
                de Otekis.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* SECTION 2 */}
      <Card id="boutique" className="border rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 relative">
          <Store className="text-primary" />
          <CardTitle>
            Contrat d’utilisateur – Propriétaire de boutique
          </CardTitle>
          <Link
            href={
              "../../files/Contrat d’utilisateur – Propriétaire de boutique.pdf"
            }
            className="absolute right-4 top-2 flex items-center 
            gap-1 text-muted-foreground hover:text-primary"
            target="_blank"
          >
            <Download />
            <span className="sr-only">Télécharger</span>
          </Link>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="1">
              <AccordionTrigger>Objet</AccordionTrigger>
              <AccordionContent>
                Ce contrat encadre l’utilisation de la plateforme Otekis par les
                utilisateurs souhaitant créer une boutique en ligne.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="2">
              <AccordionTrigger>Création de boutique</AccordionTrigger>
              <AccordionContent>
                Toute personne majeure peut créer une boutique gratuitement.
                L’utilisateur choisit le nom, le type de produits, le logo et
                personnalise le design via l’interface.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="3">
              <AccordionTrigger>Produits</AccordionTrigger>
              <AccordionContent>
                Seuls les produits fournis par Otekis peuvent être proposés. Le
                stock est unique et géré par l’administrateur.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="4">
              <AccordionTrigger>Prix et marge</AccordionTrigger>
              <AccordionContent>
                <p>
                  L’utilisateur fixe une marge libre au-dessus du prix de base.
                  Otekis encaisse le paiement, puis reverse la marge après
                  déduction :
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>
                    <strong>3,5 % de frais</strong> sur la marge et sur la part
                    Otekis (frais de paiement mobile)
                  </li>
                  <li>
                    <strong>2 % de frais</strong> lors du transfert vers le
                    portefeuille mobile du vendeur
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="5">
              <AccordionTrigger>Reversement</AccordionTrigger>
              <AccordionContent>
                La marge devient disponible{" "}
                <strong>4 jours après l’achat</strong>. Les reversements sont
                effectués <strong>chaque samedi</strong>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="6">
              <AccordionTrigger>Responsabilités</AccordionTrigger>
              <AccordionContent>
                Le vendeur est responsable du bon fonctionnement de sa boutique
                et du respect des lois congolaises. Otekis gère le stock, la
                livraison et le paiement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="7">
              <AccordionTrigger>Suspension</AccordionTrigger>
              <AccordionContent>
                Otekis peut suspendre une boutique en cas de fraude, non-respect
                du contrat ou activité illicite.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="8">
              <AccordionTrigger>Données personnelles</AccordionTrigger>
              <AccordionContent>
                Otekis s&apos;engage à protéger les données personnelles des
                utilisateurs. Les informations collectées sont utilisées
                conformément à notre politique de confidentialité. L’utilisateur
                peut demander leur suppression.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="9">
              <AccordionTrigger>Droit applicable</AccordionTrigger>
              <AccordionContent>
                Ce contrat est régi par le droit congolais. En cas de litige,
                les juridictions compétentes sont celles du siège social de
                Otekis.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* SECTION 3 */}
      <Card id="acheteurs" className="border rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 relative">
          <ShoppingCart className="text-primary" />
          <CardTitle>Contrat d’utilisateur – Acheteur</CardTitle>
          <Link
            href={"../../files/Contrat d’utilisateur – Acheteur.pdf"}
            className="absolute right-4 top-2 flex items-center 
            gap-1 text-muted-foreground hover:text-primary"
            target="_blank"
          >
            <Download />
            <span className="sr-only">Télécharger</span>
          </Link>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="1">
              <AccordionTrigger>Objet</AccordionTrigger>
              <AccordionContent>
                Ce contrat encadre l’utilisation de la plateforme Otekis par les
                acheteurs souhaitant commander des produits via les boutiques en
                ligne.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="2">
              <AccordionTrigger>Acceptation</AccordionTrigger>
              <AccordionContent>
                En passant commande, l’acheteur accepte les CGV et les présentes
                conditions d’utilisation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="3">
              <AccordionTrigger>Paiement</AccordionTrigger>
              <AccordionContent>
                Le paiement est effectué via mobile money. Otekis encaisse le
                montant total, incluant la marge du vendeur.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="4">
              <AccordionTrigger>Livraison</AccordionTrigger>
              <AccordionContent>
                La livraison est assurée en main propre par le service interne
                de Otekis ou par une entreprise tierce partenaire. L’acheteur
                confirme la réception par QR code.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="5">
              <AccordionTrigger>Annulation</AccordionTrigger>
              <AccordionContent>
                L’acheteur peut annuler sa commande avant que le produit soit
                récupéré par le livreur. Des frais de transfert peuvent
                s’appliquer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="6">
              <AccordionTrigger>Données personnelles</AccordionTrigger>
              <AccordionContent>
                Les données collectées sont utilisées uniquement pour le
                traitement de la commande. L’acheteur peut demander leur
                suppression.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="7">
              <AccordionTrigger>Droit applicable</AccordionTrigger>
              <AccordionContent>
                Ce contrat est régi par le droit congolais. En cas de litige,
                les juridictions compétentes sont celles du siège social de
                Otekis.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConditionsAndTerms;
