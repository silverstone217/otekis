"use client";

import { OtekisDescData } from "@/utils/data";
import React, { useRef } from "react";
import { motion } from "framer-motion";

const WhatWeDoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="w-full flex flex-col md:flex-row gap-10 max-w-7xl mx-auto
      transition-all duration-500 ease-in-out min-h-[60dvh] px-8 py-20"
    >
      {/* grid 1 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }} // force un déclenchement plus tôt
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-4 tracking-wide flex-1 pb-8 border-b-2"
      >
        <h2 className="text-4xl font-bold text-balance">{`Qu'est-ce que nous faisons chez Otekis ?`}</h2>
        <p className="text-gray-600 text-lg text-balance">{`Chez Otekis, nous révolutionnons le commerce en ligne en offrant une plateforme e-commerce intuitive qui permet aux particuliers de créer leur propre boutique en ligne en toute simplicité. Notre objectif est de rendre le processus de vente accessible à tous, qu'ils soient novices ou expérimentés dans le domaine du commerce électronique.`}</p>
      </motion.div>

      {/* grid 2 */}
      <div
        className="flex flex-col gap-14 flex-1 transition-all 
      duration-500 ease-in-out"
      >
        {OtekisDescData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.15 }}
            className="flex flex-col gap-4 tracking-wide text-balance 
            transition-all duration-500 ease-in-out pb-8 border-b-2"
          >
            <h2 className="text-4xl font-bold">{item.title}</h2>
            <p className="text-gray-600 text-lg">{item.description}</p>
            <item.icon size={80} className="text-blue-500" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhatWeDoSection;
