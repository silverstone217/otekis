"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Store, Truck, Users } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Créez votre boutique gratuitement",
    description:
      "Lancez votre activité en ligne sans investissement initial. Personnalisez votre boutique, ajoutez vos produits et commencez à vendre en quelques clics.",
    icon: Store,
    image:
      "https://images.unsplash.com/photo-1758521541622-d1e6be8c39bb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1932",
    link: "/ma-boutique",
  },
  {
    id: 2,
    title: "Livraison gérée par Otekis",
    description:
      "Concentrez-vous sur vos ventes, nous nous occupons de la logistique. Grâce à nos partenaires, vos clients reçoivent leurs produits rapidement et en toute sécurité.",
    icon: Truck,
    image:
      "https://images.unsplash.com/photo-1625178007931-2a70bda3ab6d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    link: "/conditions-et-termes#livraison",
  },
  {
    id: 3,
    title: "Une communauté de vendeurs dynamique",
    description:
      "Rejoignez des centaines d’entrepreneurs qui bâtissent leur succès avec Otekis. Ensemble, développons un écosystème de commerce digital africain.",
    icon: Users,
    image:
      "https://images.unsplash.com/photo-1573164574397-dd250bc8a598?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2069",
    link: "/a-propos",
  },
];

export default function HelpSection() {
  return (
    <section className="w-full py-20 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Développez votre activité avec Otekis
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            Découvrez comment notre plateforme facilite la vente en ligne,
            depuis la création de votre boutique jusqu’à la livraison.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>

                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </p>

                    <Button
                      asChild
                      variant="ghost"
                      className="group text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Link href={feature.link}>
                        <span className="flex items-center gap-1">
                          En savoir plus
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
