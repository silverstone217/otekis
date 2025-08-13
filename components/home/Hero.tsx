"use client";
import React from "react";
import business1 from "@/public/images/business1.jpeg";
import business2 from "@/public/images/business5.jpg";
import business3 from "@/public/images/business4.jpg";
import Link from "next/link";
import Image from "next/image";
import { Boxes, HandHelping, Play } from "lucide-react";

const Hero = () => {
  return (
    <section
      className="w-full relative flex flex-col lg:flex-row
  transition-all ease-in-out duration-500
 p-4 mx-auto max-w-7xl "
    >
      {/* text and presentation */}
      <div
        className="flex flex-col items-start justify-start lg:justify-center gap-10
        min-h-72 lg:flex-1 w-full lg:w-fit py-5 md:py-14 lg:gap-14 "
      >
        {/* greeting */}
        <h1
          className="text-5xl font-extrabold tracking-wide
        bg-gradient-to-r from-blue-700 via-sky-500 to-indigo-400 
        inline-block text-transparent bg-clip-text
         "
        >
          {"La création de votre boutique, n'a jamais été aussi facile"}{" "}
        </h1>
        <p className="opacity-85 text-lg lg:pr-10">
          Nous vous aidons lancer à facilement votre business en ligne et nous
          mettons un système pour que vous réalisez vos rêves rapidement.
        </p>

        {/* div button */}
        <div className="flex w-full flex-wrap gap-6 item-center justify-center lg:justify-start">
          <Link
            href={"/ma-boutique/"}
            className="border-2 px-4 lg:px-6 py-2 text-lg font-medium w-full lg:w-fit text-center
            bg-primary text-white border-primary dark:text-black shadow-2xl
            hover:bg-transparent hover:dark:text-white hover:text-black
            transition-all ease-in-out duration-500"
          >
            Lancer votre boutique
          </Link>

          {/* play link video */}
          <Link
            href={"#"}
            className="flex gap-2 place-items-center justify-center w-full lg:w-fit"
          >
            <div
              className="w-10 h-10 rounded-full grid place-content-center 
            justify-center bg-blue-600 flex-shrink-0"
            >
              <Play className="size-4 text-white flex-shrink-0" />
            </div>

            <span className="text-sm font-medium opacity-75">
              Voire comment lancer
            </span>
          </Link>
        </div>
      </div>

      {/* images */}
      <div
        className="flex items-end justify-center relative 
        min-h-72 lg:flex-1 w-full lg:w-fit gap-4 lg:gap-8 py-10
        transition-all ease-in-out duration-500
        "
      >
        {/* details 1 */}
        <div
          className="px-4 rounded py-4 flex item-center justify-start gap-2 shadow-2xl
        transition-all ease-in-out duration-300 absolute lg:top-24 top-16 left-1 lg:left-16 z-20
        border-gray-100 border-2 bg-white text-black dark:text-black
        "
        >
          <Boxes className="flex-shrink-0 size-8" />
          <div className="flex-1 flex flex-col text-xs font-medium gap-1.5">
            <p>Aide sur la logistique et la livraison </p>
            <p className="opacity-65">+ de 1000 produits</p>
          </div>
        </div>

        {/* details 2 */}
        <div
          className="px-4 rounded py-4 flex item-center justify-start gap-2 shadow-2xl
        transition-all ease-in-out duration-300 absolute bottom-4 right-1 lg:right-0 z-20
        border-gray-100 border-2 bg-white text-black dark:text-black
        "
        >
          <HandHelping className="flex-shrink-0 size-8" />
          <div className="flex-1 flex flex-col text-xs font-medium gap-1.5">
            <p>Soutien et service client disponible </p>
            <p className="opacity-65">24 heures/24 et 7 jours/7</p>
          </div>
        </div>

        <div
          className="lg:w-24 w-28 h-48 rounded-[80px] 
        overflow-hidden flex item-center justify-center"
        >
          <Image
            src={business2}
            alt={"presentation image"}
            width={2000}
            height={2000}
            priority
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="lg:w-32 w-28 h-64 rounded-[80px] 
        overflow-hidden flex item-center justify-center"
        >
          <Image
            src={business3}
            alt={"presentation image"}
            width={2000}
            height={2000}
            priority
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:w-48 w-40 h-96 rounded-[150px] overflow-hidden flex item-center justify-center">
          <Image
            src={business1}
            alt={"presentation image"}
            width={2000}
            height={2000}
            priority
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
