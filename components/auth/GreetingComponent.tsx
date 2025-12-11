"use client";
import React, { Suspense, useEffect, useState } from "react";
import nature1 from "@/public/images/nature1.jpeg";
import business2 from "@/public/images/business2.jpeg";
import business3 from "@/public/images/business3.jpeg";
import travel3 from "@/public/images/travel3.jpeg";
import nature2 from "@/public/images/nature2.jpeg";
import { siteName } from "@/utils/data";
import Link from "next/link";
import Image from "next/image";
import { Quote } from "lucide-react";

const imageSlider = [travel3, nature1, business2, business3, nature2];

const GreetingComponent = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index + 1) % imageSlider.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <div
      className="h-full w-full from-35%
  bg-linear-to-b from-transparent via-overlay3 to-black 
  transition-all ease-in-out duration-300 text-white"
    >
      {/* images */}
      <div
        className="w-full absolute -z-10 bg-gray-400 h-full flex 
      items-center justify-center"
      >
        <Suspense>
          <Image
            src={imageSlider[index]}
            alt="image presentation"
            width={2000}
            height={2000}
            priority
            className="size-full object-cover transition-all ease-in-out duration-300"
          />
        </Suspense>
      </div>
      {/* text */}
      <div
        className="bg-linear-to-b transition-all ease-in-out duration-300
      from-overlay1 h-full w-full via-transparent to-overlay1 flex flex-col 
       via-45% p-4 items-start justify-between"
      >
        <Link
          href={"/"}
          className="font-extrabold tracking-tight text-3xl capitalize"
        >
          {siteName}.
        </Link>
        <div className="text-balance w-full flex flex-col gap-2 ">
          <div className="flex flex-wrap gap-2 w-full p-4 relative">
            <Quote className="size-5 shrink-0 absolute top-0 left-0" />
            <p className="font-normal text-gray-200 px-4">
              {
                "J’ai toujours voulu créer une entreprise. J’avais ça dans les tripes. J’ai attendu bêtement dix ans avant d’en créer une première. Il ne faut jamais attendre, c’est le premier conseil que je donne aux jeunes."
              }
            </p>
            <Quote className="size-5 shrink-0 absolute bottom-2 right-0" />
          </div>
          <p className="text-sm opacity-80 px-4">
            <strong>Jean-Baptiste Rudelle</strong>, fondateur de Criteo à l’âge
            de 36 ans.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreetingComponent;
