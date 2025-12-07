"use client";
import { CategoriesData } from "@/utils/data";
import { returnDataValue } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";
import { Shop, Preferences, Contact } from "@/lib/generated/prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  CiInstagram,
  CiMail,
  CiYoutube,
  CiFacebook,
  CiPhone,
  CiTwitter,
} from "react-icons/ci";
import { FaPinterestP } from "react-icons/fa";

type Props = {
  shop: Shop;
  preference: Preferences;
  contacts: Contact | null;
};

const ShopFooter = ({ shop, preference, contacts }: Props) => {
  //   const { data: session } = useSession();
  //   const user = session?.user;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <footer
      //   style={{ backgroundColor: preference.background }}
      className="w-full bg-black/10 pt-16"
    >
      <div className="w-full flex-col flex gap-10 items-start justify-start">
        {/* info shop */}
        <div className="w-full flex-col flex gap-10 ">
          {/* name && logo */}
          <div className="w-full flex-col flex gap-10 max-w-7xl mx-auto ">
            <div className="flex gap-4 px-4 items-start">
              {/* logo */}
              <Image
                src={shop.logo}
                alt="logo"
                width={100}
                height={100}
                priority
                className="object-cover size-10"
                style={{
                  borderRadius: preference.buttonRadius,
                }}
              />
              <div className="font-black tracking-wide text-xl capitalize">
                <h2>{shop.name}</h2>
                <p className="text-xs opacity-75">
                  {returnDataValue(shop.category, CategoriesData)}
                </p>
              </div>
            </div>
          </div>

          {/* desc */}
          <div className="w-full max-w-7xl px-4 mx-auto">
            <p className="text-sm opacity-75 max-w-sm">
              {capitalizeText(shop.description).slice(0, 150)}{" "}
              {shop.description.length > 153 && "..."}
            </p>

            {/* email && phone */}
            <div className="w-full flex gap-3 flex-wrap mt-4">
              {/* email */}
              {contacts?.email && (
                <Link
                  href={`mailto:${contacts.email}`}
                  className="text-xs flex items-center justify-center px-2 gap-2 py-1
                  hover:opacity-75 transition-all duration-500 ease-in-out bg-black/10
                   "
                  style={{
                    borderRadius: preference.buttonRadius,
                  }}
                >
                  <CiMail size={20} />
                  <span>{contacts.email}</span>
                </Link>
              )}
              {/* phone */}
              {contacts?.phone && (
                <Link
                  href={`tel:${contacts.phone}`}
                  className="text-xs flex items-center justify-center px-2 gap-2 py-1
                  hover:opacity-75 transition-all duration-500 ease-in-out bg-black/10
                  "
                  style={{
                    // backgroundColor: "dimgray",
                    borderRadius: preference.buttonRadius,
                  }}
                >
                  <CiPhone size={20} />
                  <span>{contacts.phone}</span>
                </Link>
              )}
            </div>
          </div>

          {/* contact */}
          <div className="w-full max-w-7xl px-4 mx-auto">
            <div className="w-full flex gap-3 flex-wrap">
              {/* faceBook */}
              {contacts?.facebook && <CiFacebook size={30} />}
              {/* Instagram */}
              {contacts?.instagram && <CiInstagram size={30} />}
              {/* twitter */}
              {contacts?.twitter && <CiTwitter size={30} />}
              {/* youtube */}
              {contacts?.youtube && <CiYoutube size={30} />}
              {/* pinterest */}
              {contacts?.pinterest && <FaPinterestP size={30} />}
            </div>
          </div>

          <div
            className="bg-black/10 text-xs  w-full items-center 
          justify-center px-4"
          >
            {/* oteki sign */}
            <div
              className=" text-xs flex gap-1.5 w-full items-center justify-center 
            py-2 max-w-7xl mx-auto flex-wrap"
            >
              <p className="text-xs font-medium">
                © {new Date().getFullYear()} <strong>Servi Group</strong> — Tous
                droits réservés.
              </p>
              <Link
                href={"/conditions-et-termes"}
                className="hover:underline ml-2"
              >
                Confidentialité et CGI.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ShopFooter;
