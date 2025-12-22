"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Package, ShieldCheck } from "lucide-react";
import { ProductWithArticle } from "@/types/data";
import { capitalizeText } from "@/utils/shopFunctions";

type Props = {
  products: ProductWithArticle[];
};

const SomeProducts = ({ products }: Props) => {
  if (!products || products.length < 1) return null;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full py-16 px-6 max-w-7xl mx-auto border-t border-gray-50">
      {/* En-tête simplifié */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Explorez notre catalogue
        </h2>
        <p className="text-gray-500 text-base max-w-2xl">
          Devenez le vendeur que vous rêviez d'être, rapidement et facilement.
          Choisissez vos produits et lancez votre activité en un clin d'œil.
        </p>
      </div>

      {/* Grille de produits compacte */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {products.slice(0, 6).map((product) => (
          <motion.div
            key={product.id}
            variants={cardVariants}
            className="group flex flex-col bg-white dark:bg-neutral-900 
            rounded-2xl border border-gray-100 dark:border-neutral-800 p-3 
            hover:border-blue-200 transition-all duration-300"
          >
            {/* Image Miniaturisée */}
            <div
              className="relative aspect-4/5 overflow-hidden rounded-xl 
            bg-gray-50 mb-3"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 
                group-hover:scale-105"
              />
              {/* Qualité Badge */}
              <div className="absolute top-1 right-2">
                <span className="flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-gray-100 dark:border-neutral-700">
                  <ShieldCheck className="size-3 text-blue-500" />
                  {product.quality}
                </span>
              </div>
            </div>

            {/* Infos produit (Simple & Clean) */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {product.category}
              </span>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {capitalizeText(product.name)}
              </h3>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-neutral-800">
                <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                  <Package size={12} />
                  <span>
                    Stock:{" "}
                    {product.Article.reduce((acc, curr) => acc + curr.stock, 0)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bouton "Voir plus" centralisé */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex justify-center"
      >
        <Link
          href="/nos-produits"
          className="group flex items-center gap-3 px-8 py-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-750 transition-all shadow-sm active:scale-95"
        >
          Voir tout le catalogue
          <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
};

export default SomeProducts;
