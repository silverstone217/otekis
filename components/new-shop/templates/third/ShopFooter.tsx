"use client";
import { CategoriesData } from "@/utils/data";
import { returnDataValue } from "@/utils/functions";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import { Shop, Preferences, Contact } from "@/lib/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiMail,
  FiPhone,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import { FaPinterest } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";

type Props = {
  shop: Shop;
  preference: Preferences;
  contacts: Contact | null;
};

const ShopFooter = ({ shop, preference, contacts }: Props) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const theme = useMemo(
    () => luminanceColor(preference.background),
    [preference.background]
  );

  const textColor = theme !== "light" ? "#1a1a1a" : "#f5f5f5";
  const subtleText = theme !== "light" ? "text-gray-600" : "text-gray-300";

  if (!isClient) return null;

  return (
    <footer
      className="w-full mt-16"
      style={{ backgroundColor: preference.background, color: textColor }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* COL 1 : Logo + description */}
        <div className="flex flex-col gap-4 items-start">
          <Image
            src={shop.logo}
            alt={shop.name}
            width={60}
            height={60}
            className="object-cover shadow-lg size-14"
            style={{ borderRadius: preference.buttonRadius }}
          />
          <h2 className="text-lg font-bold">{shop.name}</h2>
          <p className={`text-sm ${subtleText}`}>
            {capitalizeText(shop.description).slice(0, 120)}
            {shop.description.length > 120 && "..."}
          </p>
          <p className="text-xs opacity-75">
            {returnDataValue(shop.category, CategoriesData)}
          </p>
        </div>

        {/* COL 2 : Navigation rapide */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-base">Navigation</h3>
          <Separator className="opacity-40" />
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link
                href={`/${shop.slug}`}
                className="hover:underline hover:opacity-80"
              >
                Accueil
              </Link>
            </li>
            <li>
              <Link
                href={`/${shop.slug}/catalogues`}
                className="hover:underline hover:opacity-80"
              >
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                href={`/${shop.slug}/about`}
                className="hover:underline hover:opacity-80"
              >
                À propos
              </Link>
            </li>
            <li>
              <Link
                href={`/${shop.slug}/contact`}
                className="hover:underline hover:opacity-80"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* COL 3 : Contact + Socials */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-base">Contact</h3>
          <Separator className="opacity-40" />
          <div className="flex flex-col gap-3 text-sm">
            {contacts?.email && (
              <Link
                href={`mailto:${contacts.email}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <FiMail /> {contacts.email}
              </Link>
            )}
            {contacts?.phone && (
              <Link
                href={`tel:${contacts.phone}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <FiPhone /> {contacts.phone}
              </Link>
            )}
          </div>

          {/* Socials */}
          <div className="flex gap-3 mt-4">
            {contacts?.facebook && (
              <Link
                href={contacts.facebook}
                target="_blank"
                className="p-2 rounded-full border hover:bg-black/10 transition"
              >
                <FiFacebook />
              </Link>
            )}
            {contacts?.instagram && (
              <Link
                href={contacts.instagram}
                target="_blank"
                className="p-2 rounded-full border hover:bg-black/10 transition"
              >
                <FiInstagram />
              </Link>
            )}
            {contacts?.twitter && (
              <Link
                href={contacts.twitter}
                target="_blank"
                className="p-2 rounded-full border hover:bg-black/10 transition"
              >
                <FiTwitter />
              </Link>
            )}
            {contacts?.youtube && (
              <Link
                href={contacts.youtube}
                target="_blank"
                className="p-2 rounded-full border hover:bg-black/10 transition"
              >
                <FiYoutube />
              </Link>
            )}
            {contacts?.pinterest && (
              <Link
                href={contacts.pinterest}
                target="_blank"
                className="p-2 rounded-full border hover:bg-black/10 transition"
              >
                <FaPinterest />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div
        className="w-full border-t border-white/20 py-4 
      text-center text-xs opacity-80"
      >
        <Link href={"/conditions-et-termes"} className="underline opacity-70">
          Confidentialité et CGI.
        </Link>
        <p className="font-medium mt-4">
          © {new Date().getFullYear()} <strong>Servi Group</strong> — Tous
          droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default ShopFooter;
