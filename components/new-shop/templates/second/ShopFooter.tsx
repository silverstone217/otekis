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

  const textColor = theme !== "light" ? "#222" : "#f5f5f5";
  const subtleText = theme !== "light" ? "text-gray-600" : "text-gray-300";

  if (!isClient) return null;

  return (
    <footer
      className="w-full relative overflow-hidden"
      style={{ backgroundColor: preference.background }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-3">
        {/* LEFT : LOGO + INFO */}
        <div className="flex flex-col gap-4 items-center lg:items-start">
          <Image
            src={shop.logo}
            alt={shop.name}
            width={70}
            height={70}
            className="object-cover size-16"
            style={{ borderRadius: preference.buttonRadius }}
          />
          <h2
            className="text-2xl font-bold tracking-wide"
            style={{ color: preference.buttonColor }}
          >
            {shop.name}
          </h2>
          <p className={`text-sm ${subtleText}`}>
            {returnDataValue(shop.category, CategoriesData)}
          </p>
          <p
            className={`text-sm max-w-sm text-center lg:text-left ${subtleText}`}
          >
            {capitalizeText(shop.description).slice(0, 160)}
            {shop.description.length > 160 && "..."}
          </p>
        </div>

        {/* CENTER : CONTACTS */}
        <div className="flex flex-col gap-4 items-center">
          <h3
            className="text-lg font-semibold uppercase tracking-wide"
            style={{ color: preference.buttonColor }}
          >
            Contact
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            {contacts?.email && (
              <Link
                href={`mailto:${contacts.email}`}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
                style={{ color: textColor }}
              >
                <FiMail size={18} /> {contacts.email}
              </Link>
            )}
            {contacts?.phone && (
              <Link
                href={`tel:${contacts.phone}`}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
                style={{ color: textColor }}
              >
                <FiPhone size={18} /> {contacts.phone}
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT : SOCIALS */}
        <div className="flex flex-col gap-4 items-center lg:items-end">
          <h3
            className="text-lg font-semibold uppercase tracking-wide"
            style={{ color: preference.buttonColor }}
          >
            Suivez-nous
          </h3>
          <div className="flex gap-5 text-2xl">
            {contacts?.facebook && (
              <Link
                href={contacts.facebook}
                target="_blank"
                className="hover:scale-110 transition-transform"
                style={{ color: textColor }}
              >
                <FiFacebook />
              </Link>
            )}
            {contacts?.instagram && (
              <Link
                href={contacts.instagram}
                target="_blank"
                className="hover:scale-110 transition-transform"
                style={{ color: textColor }}
              >
                <FiInstagram />
              </Link>
            )}
            {contacts?.twitter && (
              <Link
                href={contacts.twitter}
                target="_blank"
                className="hover:scale-110 transition-transform"
                style={{ color: textColor }}
              >
                <FiTwitter />
              </Link>
            )}
            {contacts?.youtube && (
              <Link
                href={contacts.youtube}
                target="_blank"
                className="hover:scale-110 transition-transform"
                style={{ color: textColor }}
              >
                <FiYoutube />
              </Link>
            )}
            {contacts?.pinterest && (
              <Link
                href={contacts.pinterest}
                target="_blank"
                className="hover:scale-110 transition-transform"
                style={{ color: textColor }}
              >
                <FaPinterest />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT */}
      <div
        className="border-t py-4 text-xs text-center flex
        items-center justify-center gap-2 flex-col w-full"
        style={{
          borderColor: theme === "light" ? "#ddd" : "rgba(255,255,255,0.2)",
          color: textColor,
        }}
      >
        <Link
          href={"/conditions-et-termes"}
          className="hover:underline opacity-70"
        >
          Confidentialité et CGI.
        </Link>

        <p className="text-xs font-medium">
          © {new Date().getFullYear()} <strong>Servi Group</strong> — Tous
          droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default ShopFooter;
