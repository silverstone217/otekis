"use client";

import { OtekisDescData } from "@/utils/data";
import React, { useRef } from "react";
import { motion, Variants } from "framer-motion";

const WhatWeDoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Variantes pour le titre principal (à gauche)
  const titleVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Variantes pour le conteneur de droite (staggering)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Variantes pour chaque item de description
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="w-full flex flex-col md:flex-row gap-10 max-w-7xl mx-auto
      transition-all duration-500 ease-in-out min-h-[60dvh] px-8 py-20"
    >
      {/* Colonne 1 : Titre et Description */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={titleVariants}
        className="flex flex-col gap-4 tracking-wide flex-1 pb-8 border-b-2 h-fit"
      >
        <h2 className="text-4xl font-bold text-balance">
          {`Qu'est-ce que nous faisons chez Otekis ?`}
        </h2>
        <p className="text-gray-600 text-lg text-balance leading-relaxed">
          {`Chez Otekis, nous révolutionnons le commerce en ligne en offrant une plateforme e-commerce intuitive qui permet aux particuliers de créer leur propre boutique en ligne en toute simplicité. Notre objectif est de rendre le processus de vente accessible à tous, qu'ils soient novices ou expérimentés dans le domaine du commerce électronique.`}
        </p>
      </motion.div>

      {/* Colonne 2 : Liste des services (Grid 2) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="flex flex-col gap-14 flex-1"
      >
        {OtekisDescData.map((item, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ x: 10 }} // Petit effet interactif au survol
            className="flex flex-col gap-4 tracking-wide text-balance 
            pb-8 border-b-2 group transition-colors duration-300"
          >
            <h2 className="text-4xl font-bold group-hover:text-blue-600 transition-colors">
              {item.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {item.description}
            </p>
            <div className="overflow-hidden w-fit">
              <item.icon
                size={80}
                className="text-blue-500 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhatWeDoSection;
