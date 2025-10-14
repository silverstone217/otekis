"use client";
import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import WhatWeDoSection from "./WhatWeDoSection";
import HelpSection from "./HelpSection";
import ContactUs from "./ContactUs";

const MainHomeComponent = () => {
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

        {/* content section */}
        <HelpSection />

        {/* contact us section */}
        <ContactUs />
      </main>
    </div>
  );
};

export default MainHomeComponent;
