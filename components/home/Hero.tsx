"use client";

import React from "react";
import business1 from "@/public/images/business1.jpeg";
import business2 from "@/public/images/business5.jpg";
import business3 from "@/public/images/business4.jpg";
import Link from "next/link";
import Image from "next/image";
import { Boxes, HandHelping, Play } from "lucide-react";
// Importez le type Variants pour un typage parfait
import { motion, Variants } from "framer-motion";

const Hero = () => {
  // Correction de l'erreur TypeScript en ajoutant le type Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut", // TypeScript accepte maintenant car l'objet est typé Variants
      },
    },
  };

  return (
    <section className="w-full relative flex flex-col lg:flex-row p-4 mx-auto max-w-7xl transition-all ease-in-out duration-500 overflow-hidden">
      {/* Texte et présentation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-start justify-start lg:justify-center gap-10 min-h-72 lg:flex-1 w-full lg:w-fit py-5 md:py-14 lg:gap-14"
      >
        <motion.h1
          variants={itemVariants}
          className="text-5xl font-extrabold tracking-wide bg-linear-to-r from-blue-700 via-sky-500 to-indigo-400 inline-block text-transparent bg-clip-text leading-tight"
        >
          Créez votre boutique en ligne facilement et rapidement
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="opacity-85 lg:text-lg lg:pr-10 text-gray-800 leading-relaxed"
        >
          Nous vous aidons à lancer facilement votre business en ligne, un
          système mis en place pour que vous réalisiez vos rêves. Chez
          <strong className="text-blue-600"> Otekis</strong>, démarrez votre
          business en quelques clics et <strong>gratuitement</strong>!
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex w-full flex-wrap gap-6 items-center justify-center lg:justify-start"
        >
          <Link
            href={"/ma-boutique/"}
            className="border-2 px-4 lg:px-6 py-2 text-lg font-medium w-full lg:w-fit text-center
            bg-black text-white border-black shadow-2xl
            hover:bg-transparent hover:text-black
            transition-all duration-300 transform hover:-translate-y-1"
          >
            Lancer votre boutique
          </Link>

          <Link
            href={"https://youtu.be/QIopnFhy440?si=iBky-qWbIiR8WeTT"}
            className="flex gap-2 items-center justify-center w-full lg:w-fit group"
            target="_blank"
          >
            <div className="w-10 h-10 rounded-full grid place-content-center bg-blue-600 transition-transform group-hover:scale-110">
              <Play className="size-4 text-white fill-current" />
            </div>
            <span className="text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity">
              Voir comment ça fonctionne
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Images (Le reste du code demeure identique à votre design original) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex items-end justify-center relative min-h-72 lg:flex-1 w-full lg:w-fit gap-4 lg:gap-8 py-10"
      >
        {/* Badge 1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.8 }}
          className="px-4 rounded py-4 flex items-center justify-start gap-2 shadow-2xl absolute lg:top-24 top-16 left-1 lg:left-16 z-20 border-gray-100 border-2 bg-white text-black"
        >
          <Boxes className="shrink-0 size-8 text-blue-600" />
          <div className="flex-1 flex flex-col text-xs font-medium gap-1.5">
            <p>Aide sur la logistique et la livraison</p>
            <p className="opacity-65">Plus de 1000 produits disponibles</p>
          </div>
        </motion.div>

        {/* Badge 2 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, delay: 1 }}
          className="px-4 rounded py-4 flex items-center justify-start gap-2 shadow-2xl absolute bottom-4 right-1 lg:right-0 z-20 border-gray-100 border-2 bg-white text-black"
        >
          <HandHelping className="shrink-0 size-8 text-blue-600" />
          <div className="flex-1 flex flex-col text-xs font-medium gap-1.5">
            <p>Soutien et service client disponible</p>
            <p className="opacity-65">24h/24 et 7j/7</p>
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="lg:w-24 w-28 h-48 rounded-[80px] overflow-hidden shadow-lg"
        >
          <Image
            src={business2}
            alt="img1"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="lg:w-32 w-28 h-64 rounded-[80px] overflow-hidden shadow-lg"
        >
          <Image
            src={business3}
            alt="img2"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="lg:w-48 w-40 h-96 rounded-[150px] overflow-hidden shadow-lg"
        >
          <Image
            src={business1}
            alt="img3"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
