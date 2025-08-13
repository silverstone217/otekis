"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AlignJustify, BookText, Shield, Store, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
// import { siteName } from "@/utils/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { changeName, returnRoleWith } from "@/utils/functions";
import { Button } from "../ui/button";
import logo from "@/public/images/oteki-logo.png";
import Image from "next/image";

const Header = () => {
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
        className={`w-full max-w-7xl mx-auto flex items-center justify-between gap-4 flex-shrink-0
      ${isOpen ? "flex-wrap" : ""}
      transition-all duration-500 ease-in-out
      `}
      >
        {/* logo */}
        <Link
          href={"/"}
          className="text-black
           text-3xl font-extrabold flex-shrink-0 flex items-center justify-center
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
        <div className="flex-1 hidden items-center justify-end lg:flex gap-10">
          {/* links */}
          <div className="flex items-center justify-end gap-4 flex-1">
            <LinkName href="/dashboard" title="Ma Boutique" />
            <LinkName href="/a-propos" title="A propos" />
            <LinkName href="/overview" title="Administrateur" />
          </div>

          {/* buttons */}
          <div className="flex gap-2.5 items-center justify-center ">
            {!user && (
              <Button
                className="py-2 px-6 rounded-md text-white hover:text-gray-900 
        transition-all duration-500 ease-in-out hover:bg-transparent"
              >
                <Link href={"/connexion"}>Connexion</Link>
              </Button>
            )}
            {/* <ToggleThemeMode /> */}
            {user && (
              <Link href={"/dashboard"} className="w-[43px] h-[43px]">
                <UserAvatar />
              </Link>
            )}
          </div>
        </div>

        {/* small screen open menu */}
        <div className="lg:hidden flex-shrink-0">
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
          <div className="w-full flex flex-col items-start gap-4 py-4 transition-all duration-500 ease-in-out">
            {/* links */}
            <div className="flex flex-col items-start justify-start gap-4 flex-1 transition-all duration-500 ease-in-out">
              <Link
                href={"/ma-boutique"}
                className="flex gap-4 items-center w-full"
              >
                <Store className="w-8 flex-shrink-0" />
                <span>Ma Boutique</span>
              </Link>
              <Link
                href={"/a-propos"}
                className="flex gap-4 items-center w-full"
              >
                <BookText className="w-8 flex-shrink-0" />
                <span>A Propos</span>
              </Link>
              <Link
                href={"/overview"}
                className="flex gap-4 items-center w-full"
              >
                <Shield className="w-8 flex-shrink-0" />
                <span>Staff*</span>
              </Link>
            </div>
            {/* separators */}
            <span className="w-full h-0.5 bg-gray-200" />
            {/* buttons */}
            <div className="flex flex-col gap-2 items-center justify-center">
              {!user && (
                <Button
                  className="py-2 px-4 rounded-md hover:text-gray-700 
            transition-all duration-500 ease-in-out border-primary border w-52"
                >
                  <Link href={"/connexion"}>connexion</Link>
                </Button>
              )}

              {/* avatar user profile */}
              {user && (
                <Link
                  href={"/dashboard"}
                  className="flex items-center justify-start gap-2"
                >
                  <div className="w-12 h-12 flex-shrink-0">
                    <UserAvatar />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold line-clamp-1">{user?.name}</span>
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {user?.email}
                    </span>
                    <span className="text-sm text-red-700 line-clamp-1">
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
      <AvatarImage
        src={user.image ? user.image : "https://github.com/shadcn.png"}
      />
      <AvatarFallback>{userNameSliced}</AvatarFallback>
    </Avatar>
  );
};
