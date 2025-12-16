"use client";
import { linksPage, siteName } from "@/utils/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SocialLinks } from "./SocialLinks";

const Footer = () => {
  const path = usePathname();

  if (
    path === "/connexion" ||
    path === "/inscription" ||
    path === "/verif-email-sent" ||
    path.includes("/shop/")
  )
    return null;

  return (
    <footer
      className="w-full px-4 pt-14 pb-4 flex flex-col gap-14
     bg-overlay3"
    >
      <div
        className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto
     "
      >
        {/* about shoppy */}
        <section className="flex flex-col w-full gap-8 items-start justify-start">
          <Link
            href={"/"}
            className="font-extrabold tracking-tight text-3xl capitalize"
          >
            {siteName}.
          </Link>
          <p className="text-sm opacity-80">
            {`Nouvelle façon de créer un business, en ligne facilement et rapidement sans gerer les stocks de produits et la livraison vers le client.
            Otekis gere tout pour vous, configurer juste vos produits et boom vous pouvez debuter.`}
          </p>
          <SocialLinks />
        </section>

        {/* links */}
        <section className="flex flex-col w-full gap-2 items-start justify-start">
          <h3 className="font-bold tracking-tight text-2xl capitalize">
            Nos liens et services
          </h3>
          <div className="py-2" />
          {linksPage.map((link, index) => (
            <Link
              href={link.path}
              key={index}
              className="font-medium transition-all duration-300 ease-in-out
          hover:underline hover:opacity-75
          "
            >
              {link.name}
            </Link>
          ))}
          <Link
            href={"#"}
            className="font-medium transition-all duration-300 ease-in-out
          hover:underline hover:opacity-75"
          >
            Services
          </Link>
          <Link
            href={"/dashboard"}
            className="font-medium transition-all duration-300 ease-in-out
          hover:underline hover:opacity-75"
          >
            Dashboard
          </Link>
          <Link
            href={"/documentation"}
            className="font-medium transition-all duration-300 ease-in-out
          hover:underline hover:opacity-75"
          >
            Documentations
          </Link>

          <Link
            href={"#"}
            className="font-medium transition-all duration-300 ease-in-out
          hover:underline hover:opacity-75"
          >
            FAQ
          </Link>

          <Link
            href={"/conditions-et-termes"}
            className="font-medium transition-all duration-300 ease-in-out
          hover:underline hover:opacity-75"
          >
            Confidentialité et CGI.
          </Link>
        </section>
        {/* form  */}
        <section className="flex flex-col w-full gap-6">
          <h3 className="font-bold tracking-tight text-2xl capitalize">
            News Letter
          </h3>
          <p className="text-sm opacity-80">
            {`Rester au courant de tout, ne manquez pas les mises à jours de nouveaux produits et services, abonnez-vous à notre newsletter`}
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="email" placeholder="Email" />
            <Button type="submit">{`S'abonner`}</Button>
          </div>
        </section>
      </div>

      {/* Informations legales */}
      <div className="w-full border-t border-white/10 pt-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs opacity-80">
          <div className="flex flex-col">
            <span className="font-semibold uppercase tracking-wide">RCCM</span>
            <span>CD/KNG/RCCM/25-B-00820</span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold uppercase tracking-wide">
              Identification nationale
            </span>
            <span>01-F4300-N63754X</span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold uppercase tracking-wide">
              Numéro d’impôt
            </span>
            <span>15/01022276M/DGI/DIRAF/DIGR/IM/2025</span>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold uppercase tracking-wide">
              Société
            </span>
            <span>Servi Group — SG SARL</span>
          </div>
        </div>
      </div>

      <div className="w-full text-center">
        <p className="text-sm font-medium">
          © {new Date().getFullYear()} <strong>Servi Group</strong> — Tous
          droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
