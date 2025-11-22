"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type Props = {
  images: string[];
  custom_height: string;
};

const ImageSliderCarrousel = ({ images, custom_height }: Props) => {
  const [index, setIndex] = useState(0);

  const handleClick = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    } else if (direction === "next") {
      setIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      throw new Error("Invalid direction");
    }
  };
  return (
    <div
      style={{
        height: custom_height,
      }}
      className="w-full"
    >
      {/* images */}
      <div className="relative w-full h-full overflow-hidden">
        <div className="w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out">
          <Image
            className="object-cover w-full h-full transition-all duration-500 ease-in-out"
            src={images[index]}
            alt={"Product article" + (index + 1)}
            key={index}
            width={1200}
            height={1000}
            priority
            unoptimized
          />
        </div>
        {images.length > 1 && (
          <div className="absolute top-1/2  -translate-y-1/2 px-2 py-2 right-0 left-0 flex item-center justify-between">
            <button
              role="button"
              className="bg-black/40 text-white flex items-center justify-center p-1
            transition-all duration-500 ease-in-out hover:bg-black/70
            "
              onClick={() => handleClick("prev")}
              style={{ borderRadius: 5 }}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              role="button"
              className="bg-black/20 text-white flex items-center justify-center p-1
            transition-all duration-500 ease-in-out hover:bg-black/70
            "
              onClick={() => handleClick("next")}
              style={{ borderRadius: 5 }}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
        {/* dots */}
        {images.length > 1 && (
          <div
            className="flex absolute bottom-4 left-0 right-0 item-center justify-center gap-2
          transition-all duration-500 ease-in-out 
          "
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`relative px-1 py-1 rounded-full border-2 
                border-transparent transition-all duration-500 ease-in-out 
                  ${
                    index === idx
                      ? "border-white shadow-2xl"
                      : "border-black/40"
                  }
                  `}
                onClick={() => setIndex(idx)}
              >
                <span
                  className={`absolute top-0 left-0 w-2 h-2 rounded-full 
                  bg-white transition-all duration-500 ease-in-out 
                  ${index === idx ? "opacity-100" : "opacity-50"}
                  `}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSliderCarrousel;
