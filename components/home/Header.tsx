"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  AlignJustify,
  BadgeInfo,
  PhoneCall,
  Users,
  Store,
  X,
  BookOpenText,
  Boxes,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
// import { siteName } from "@/utils/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { changeName, returnRoleWith } from "@/utils/functions";
import { Button } from "../ui/button";
import logo from "@/public/images/oteki-logo.png";
import Image from "next/image";
import { NavLink } from "./NavLink";
import { MobileNavItem } from "./MobileNavItem";

const PERMIT_ROLES = ["employe", "employee", , "admin", "super_admin"];

const Header = ({ hasShop }: { hasShop: { slug: string } | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  // const router = useRouter();
  // const [loading, setLoading] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  return (
    <header
      className={`w-full p-4 z-50 lg:h-[70px] h-16 fixed left-0 top-0 
        
    ${
      isOpen
        ? " w-full h-[99dvh] overflow-x-hidden overflow-y-auto flex-wrap bg-white"
        : "bg-white/40 backdrop-blur-lg"
    }
     transition-all duration-500 ease-in-out
    `}
    >
      <div
        className={`w-full max-w-7xl mx-auto flex items-center justify-between gap-4 shrink-0
      ${isOpen ? "flex-wrap" : ""}
      transition-all duration-500 ease-in-out
      `}
      >
        {/* logo */}
        <Link
          href={"/"}
          className="text-black
           text-3xl font-extrabold shrink-0 flex items-center justify-center
           transition-all duration-500 ease-in-out
           "
        >
          <Image
            src={logo}
            alt="logo"
            width={250}
            height={250}
            className="w-10 object-cover"
            priority
          />
          <span>tekis.</span>
        </Link>

        {/* links and others*/}
        <div className="flex-1 hidden lg:flex items-center justify-end gap-10">
          {/* Navigation */}
          <div className="flex items-center gap-6">
            <NavLink href="/dashboard" title="Ma Boutique" />
            <NavLink href="/fournisseurs" title="Fournisseurs" />
            <NavLink href="/documentation" title="Docs" />
            <NavLink href="/a-propos" title="A propos" />
            <NavLink href="#contact" title="Nous Contacter" />
            {user && PERMIT_ROLES.includes(user.role) && (
              <NavLink href="/overview" title="Administrateur" />
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* CTA Boutique officielle */}
            {user && hasShop && (
              <Link href={`/${hasShop.slug}`}>
                <div
                  className="
          px-4 py-2 rounded-lg
          bg-neutral-900 text-white text-sm font-medium
          transition-all duration-300
          hover:bg-black
        "
                >
                  Visiter ma boutique
                </div>
              </Link>
            )}

            {!user && (
              <Link href={"/connexion"}>
                <Button className="px-5 py-2 rounded-lg">Connexion</Button>
              </Link>
            )}

            {user && (
              <Link href={"/dashboard"} className="w-10 h-10">
                <UserAvatar />
              </Link>
            )}
          </div>
        </div>

        {/* small screen open menu */}
        <div className="lg:hidden shrink-0">
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center
            bg-transparent rounded-full focus:outline-none"
          >
            {isOpen ? <X className="w-10" /> : <AlignJustify className="w-8" />}
          </button>
        </div>

        {/* small screen menu */}
        {isOpen && (
          <div className="w-full flex flex-col px-6 pt-6 pb-10 gap-6">
            {/* CTA Boutique officielle */}
            {user && hasShop && (
              <Link
                href={`/${hasShop.slug}`}
                onClick={() => setIsOpen(false)}
                className="block"
              >
                <div
                  className="
          rounded-2xl p-5
          bg-neutral-900 text-white
        "
                >
                  <span className="text-xs opacity-70 block">
                    Boutique officielle
                  </span>
                  <span className="text-lg font-semibold">
                    Voir ma boutique
                  </span>
                </div>
              </Link>
            )}

            {/* Navigation */}
            <div className="flex flex-col">
              <MobileNavItem
                href="/ma-boutique"
                icon={Store}
                title="Ma Boutique"
                setIsOpen={setIsOpen}
              />

              <MobileNavItem
                href="/fournisseurs"
                icon={Boxes}
                title="Fournisseurs"
                setIsOpen={setIsOpen}
              />

              <MobileNavItem
                href="/documentation"
                icon={BookOpenText}
                title="Documentation"
                setIsOpen={setIsOpen}
              />

              <MobileNavItem
                href="/a-propos"
                icon={BadgeInfo}
                title="A Propos"
                setIsOpen={setIsOpen}
              />

              <MobileNavItem
                href="#contact"
                icon={PhoneCall}
                title="Nous Contacter"
                setIsOpen={setIsOpen}
              />

              {user && PERMIT_ROLES.includes(user.role) && (
                <MobileNavItem
                  href="/overview"
                  icon={Users}
                  title="Staff"
                  setIsOpen={setIsOpen}
                />
              )}
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Bottom section */}
            <div className="flex flex-col gap-4">
              {!user && (
                <Link href="/connexion" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-xl">Connexion</Button>
                </Link>
              )}

              {user && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
                >
                  <div className="w-10 h-10">
                    <UserAvatar />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold truncate">{user?.name}</span>
                    <span className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </span>
                    <span className="text-xs text-gray-400">
                      {returnRoleWith(user?.role)}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

type LinkType = {
  href: string;
  title: string;
};

// link big screens
export const LinkName = ({ href, title }: LinkType) => {
  const pathname = usePathname();

  const isTheLink = pathname === href;

  return (
    <Link
      href={href}
      className={` 
        ${isTheLink ? "text-white" : ""}
        hover:text-black 
        transition-all duration-300 ease-in-out hover:scale-110 cursor-pointer
        `}
    >
      {title}
    </Link>
  );
};

// avatar profile
export const UserAvatar = () => {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;

  const userNameSliced = changeName(user.name);
  return (
    <Avatar>
      {user.image ? (
        <AvatarImage src={user.image} />
      ) : (
        <AvatarFallback className="font-bold">{userNameSliced}</AvatarFallback>
      )}
    </Avatar>
  );
};
