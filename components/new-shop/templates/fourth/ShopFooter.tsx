"use client";
import { CategoriesData, siteName } from "@/utils/data";
import { returnDataValue } from "@/utils/functions";
import { capitalizeText, luminanceColor } from "@/utils/shopFunctions";
import { Shop, Preferences, Contact } from "@prisma/client";
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

  const bgIsLightOrDark = useMemo(
    () => luminanceColor(preference.background),
    [preference.background]
  );

  const backdropStyles = {
    backgroundColor:
      bgIsLightOrDark !== "light"
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.35)",
    borderColor:
      bgIsLightOrDark !== "light" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    textColor:
      bgIsLightOrDark !== "light" ? "text-neutral-900" : "text-neutral-100",
  };
  if (!isClient) return null;

  return (
    <footer
      className="relative w-full mt-20 backdrop-blur-xl"
      style={{ backgroundColor: preference.background }}
    >
      {/* TOP : Info + Logo + Desc + Contacts */}
      <div
        className={`max-w-7xl mx-auto px-6 py-10 flex flex-col 
          md:flex-row items-start md:items-center justify-between 
          gap-8 md:gap-16 rounded-3xl border  flex-wrap`}
        style={{
          borderRadius: preference.buttonRadius,
          backgroundColor: backdropStyles.backgroundColor,
          border: `1px solid ${backdropStyles.borderColor}`,
        }}
      >
        {/* Logo + name */}
        <div className="flex items-center gap-4">
          <Image
            src={shop.logo}
            alt={shop.name}
            width={60}
            height={60}
            className="object-cover shadow-md size-14"
            style={{ borderRadius: preference.buttonRadius }}
          />
          <div>
            <h2 className="font-bold text-lg">{shop.name}</h2>
            <p className="text-xs opacity-70">
              {returnDataValue(shop.category, CategoriesData)}
            </p>
          </div>
        </div>

        {/* Desc */}
        <p className="text-sm max-w-md leading-relaxed opacity-80">
          {capitalizeText(shop.description).slice(0, 160)}
          {shop.description.length > 160 && "..."}
        </p>

        {/* Contacts */}
        <div className="flex flex-col gap-3 text-sm">
          {contacts?.email && (
            <Link
              href={`mailto:${contacts.email}`}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <FiMail /> {contacts.email}
            </Link>
          )}
          {contacts?.phone && (
            <Link
              href={`tel:${contacts.phone}`}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <FiPhone /> {contacts.phone}
            </Link>
          )}
        </div>

        {/* SOCIALS */}
        <div
          className={`md:mt-0 mt-4 w-full px-6 py-6 flex flex-wrap gap-4 items-center justify-center`}
        >
          {contacts?.facebook && (
            <Link
              href={contacts.facebook}
              target="_blank"
              className="p-3 rounded-full backdrop-blur-md border bg-white/10 hover:scale-110 transition"
            >
              <FiFacebook />
            </Link>
          )}
          {contacts?.instagram && (
            <Link
              href={contacts.instagram}
              target="_blank"
              className="p-3 rounded-full backdrop-blur-md border bg-white/10 hover:scale-110 transition"
            >
              <FiInstagram />
            </Link>
          )}
          {contacts?.twitter && (
            <Link
              href={contacts.twitter}
              target="_blank"
              className="p-3 rounded-full backdrop-blur-md border bg-white/10 hover:scale-110 transition"
            >
              <FiTwitter />
            </Link>
          )}
          {contacts?.youtube && (
            <Link
              href={contacts.youtube}
              target="_blank"
              className="p-3 rounded-full backdrop-blur-md border bg-white/10 hover:scale-110 transition"
            >
              <FiYoutube />
            </Link>
          )}
          {contacts?.pinterest && (
            <Link
              href={contacts.pinterest}
              target="_blank"
              className="p-3 rounded-full backdrop-blur-md border bg-white/10 hover:scale-110 transition"
            >
              <FaPinterest />
            </Link>
          )}
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className={`w-full py-4  mt-4`}>
        <p
          className="text-xs opacity-70 text-center"
          style={{ color: "dimgray" }}
        >
          © {new Date().getFullYear()} <strong>{siteName}</strong>. Tous droits
          réservés.
        </p>
      </div>
    </footer>
  );
};

export default ShopFooter;
