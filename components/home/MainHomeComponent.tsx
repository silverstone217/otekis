"use client";
import React, { Suspense } from "react";
import Header from "./Header";
import Hero from "./Hero";
import WhatWeDoSection from "./WhatWeDoSection";
import HelpSection from "./HelpSection";
import ContactUs from "./ContactUs";
import { ProductWithArticle } from "@/types/data";
import SomeProducts from "./SomeProducts";

type Props = {
  products: ProductWithArticle[];
};

const MainHomeComponent = ({ products }: Props) => {
  return (
    <div className="w-full flex gap-10 flex-col">
      {/* header */}
      <Header />
      {/* content */}
      <main className="py-14 space-y-4 ">
        {/* hero section */}
        <Hero />
        {/* content section */}
        <WhatWeDoSection />

        {/* SOME products */}
        <Suspense>
          <SomeProducts products={products} />
        </Suspense>

        {/* content section */}
        <HelpSection />

        {/* contact us section */}
        <ContactUs />
      </main>
    </div>
  );
};

export default MainHomeComponent;
