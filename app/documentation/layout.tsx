import BigScreenAsideNav from "@/components/docs/BigScreenAsideNav";
import SmallScreenSheetNav from "@/components/docs/SmallScreenSheetNav";
import { siteName } from "@/utils/data";
import { capitalizeText } from "@/utils/shopFunctions";
import React from "react";

type LayoutProps = {
  children: React.ReactNode;
};

function layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* header fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <div
          className="max-w-7xl mx-auto px-4 h-12 flex items-center 
        justify-between"
        >
          <h1 className="text-xl font-bold">{capitalizeText(siteName!)}</h1>
          <span className="lg:hidden">
            <SmallScreenSheetNav />
          </span>
        </div>
      </header>

      {/* main content */}
      <main className="mt-16">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-start w-full">
          {/* nav big screen */}
          <aside className="hidden lg:block w-[250px]  min-h-96">
            <BigScreenAsideNav />
          </aside>
          {/* Content goes here */}
          <aside className="flex-1 ">{children}</aside>
        </div>
      </main>

      {/* footer */}
      <footer className="bg-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()}{" "}
            <strong>{capitalizeText(siteName!)}</strong>. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default layout;
