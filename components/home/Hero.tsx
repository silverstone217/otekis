"use client";

import React from "react";
import business1 from "@/public/images/business1.jpeg";
import business2 from "@/public/images/business5.jpg";
import business3 from "@/public/images/business4.jpg";
import Link from "next/link";
import Image from "next/image";
import { Boxes, HandHelping, Play } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="w-full relative flex flex-col lg:flex-row p-4 mx-auto max-w-7xl transition-all ease-in-out duration-500">
      {/* Texte et présentation */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-start justify-start lg:justify-center gap-10 min-h-72 lg:flex-1 w-full lg:w-fit py-5 md:py-14 lg:gap-14"
      >
        {/* Titre */}
        <h1 className="text-5xl font-extrabold tracking-wide bg-gradient-to-r from-blue-700 via-sky-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Créez votre boutique en ligne facilement et rapidement
        </h1>

        {/* Description */}
        <p className="opacity-85 lg:text-lg lg:pr-10 text-gray-800 leading-relaxed">
          Nous vous aidons à lancer facilement votre business en ligne, un
          système mis en place pour que vous réalisiez vos rêves. Chez
          <strong className="text-blue-600"> Otekis</strong>, démarrez votre
          business en quelques clics!
        </p>

        {/* Boutons */}
        <div className="flex w-full flex-wrap gap-6 items-center justify-center lg:justify-start">
          <Link
            href={"/ma-boutique/"}
            className="border-2 px-4 lg:px-6 py-2 text-lg font-medium w-full lg:w-fit text-center
            bg-primary text-white border-primary dark:text-black shadow-2xl
            hover:bg-transparent hover:dark:text-white hover:text-black
            transition-all ease-in-out duration-500"
          >
            Lancer votre boutique
          </Link>

          <Link
            href={"#"}
            className="flex gap-2 items-center justify-center w-full lg:w-fit"
          >
            <div className="w-10 h-10 rounded-full grid place-content-center bg-blue-600">
              <Play className="size-4 text-white" />
            </div>
            <span className="text-sm font-medium opacity-75">
              Voir comment ça fonctionne
            </span>
          </Link>
        </div>
      </motion.div>

      {/* Images */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-end justify-center relative min-h-72 lg:flex-1 w-full lg:w-fit gap-4 lg:gap-8 py-10 transition-all ease-in-out duration-500"
      >
        {/* Détails 1 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-4 rounded py-4 flex items-center justify-start gap-2 shadow-2xl absolute lg:top-24 top-16 left-1 lg:left-16 z-20 border-gray-100 border-2 bg-white text-black"
        >
          <Boxes className="flex-shrink-0 size-8" />
          <div className="flex-1 flex flex-col text-xs font-medium gap-1.5">
            <p>Aide sur la logistique et la livraison</p>
            <p className="opacity-65">Plus de 1000 produits disponibles</p>
          </div>
        </motion.div>

        {/* Détails 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="px-4 rounded py-4 flex items-center justify-start gap-2 shadow-2xl absolute bottom-4 right-1 lg:right-0 z-20 border-gray-100 border-2 bg-white text-black"
        >
          <HandHelping className="flex-shrink-0 size-8" />
          <div className="flex-1 flex flex-col text-xs font-medium gap-1.5">
            <p>Soutien et service client disponible</p>
            <p className="opacity-65">24h/24 et 7j/7</p>
          </div>
        </motion.div>

        {/* Images principales */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="lg:w-24 w-28 h-48 rounded-[80px] overflow-hidden flex items-center justify-center"
        >
          <Image
            src={business2}
            alt="Présentation image 1"
            width={2000}
            height={2000}
            priority
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="lg:w-32 w-28 h-64 rounded-[80px] overflow-hidden flex items-center justify-center"
        >
          <Image
            src={business3}
            alt="Présentation image 2"
            width={2000}
            height={2000}
            priority
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="lg:w-48 w-40 h-96 rounded-[150px] overflow-hidden flex items-center justify-center"
        >
          <Image
            src={business1}
            alt="Présentation image 3"
            width={2000}
            height={2000}
            priority
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
