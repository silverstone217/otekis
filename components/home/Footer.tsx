"use client";
import { linksPage, siteName } from "@/utils/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FaFacebookF } from "react-icons/fa6";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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
          <div className="flex item-center justify-start gap-4">
            <FaFacebookF
              size={25}
              className="cursor-pointer hover:opacity-75
          transition-all duration-300 ease-in-out"
            />
            <FaInstagram
              size={25}
              className="cursor-pointer hover:opacity-75
          transition-all duration-300 ease-in-out"
            />
            <FaYoutube
              size={25}
              className="cursor-pointer hover:opacity-75
          transition-all duration-300 ease-in-out"
            />
          </div>
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
            href={"#"}
            className="font-medium transition-all duration-300 ease-in-out
          hover:underline hover:opacity-75"
          >
            FAQ
          </Link>
          <Link
            href={"#"}
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

      <div className="w-full text-center">
        <p className="text-sm font-medium">
          &copy; {`${new Date().getFullYear()}`} <strong> {siteName}</strong>{" "}
          inc. Tous droits réservés. &nbsp;
        </p>
      </div>
    </footer>
  );
};

export default Footer;
