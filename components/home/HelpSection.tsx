import React, { useEffect, useState } from "react";
import business3 from "@/public/images/business3.jpeg";
import business4 from "@/public/images/business2.jpeg";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

const HelpData = [
  {
    id: 1,
    image: business3,
    description: "Transformer votre vie et quotidien en un clique.",
    button: "En savoir plus",
    link: "/ma-boutique/",
  },
  {
    id: 2,
    image: business4,
    description: "Ouvrir votre espace de vendeur et gérer vos ventes.",
    button: "En savoir plus",
    link: "/ma-boutique/",
  },
];

const HelpSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index + 1) % HelpData.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <section className="w-full py-10 lg:px-8 px-4">
      <div className="relative w-full h-[60dvh] group overflow-hidden">
        {/* image */}
        <Image
          src={HelpData[index].image}
          alt="image"
          width={1800}
          height={1400}
          priority
          className="w-full h-full object-cover group-hover:scale-110
          transition-all duration-500 ease-in-out
          "
        />

        {/* texts and button */}
        <div
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center
        transition-all duration-500 ease-in-out  lg:group-hover:bg-black/10 
        lg:bg-transparent bg-black/10
        "
        >
          <div
            id={HelpData[index].id.toString()}
            className="lg:group-hover:opacity-100 flex flex-col items-center justify-center gap-4 px-2 text-center
            transition-all duration-500 ease-in-out lg:opacity-0
            "
          >
            <h1 className="lg:text-4xl sm:text-xl text-3xl font-bold text-white max-w-xl mx-auto">
              {HelpData[index].description}
            </h1>
            <Button
              className="bg-white text-black px-8 py-2 rounded-full 
            hover:bg-white/50 hover:text-black transition-all duration-500 ease-in-out"
              asChild
            >
              <Link href={HelpData[index].link}>{HelpData[index].button}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpSection;
