"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AlignJustify, LogOut, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { SellerLinksPage, siteName } from "@/utils/data";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "../home/Header";
import { returnRole } from "@/utils/functions";
import { Button } from "../ui/button";
import { toast } from "sonner";

const HeaderSmallScreen = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogOut = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      router.refresh();
    } catch (error) {
      console.error("Failed to log out", error);
      const err = error as Error;
      toast.error("Erreur lors de la déconnexion", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <header
      className={`w-full py-4 p-2 z-50 bg-white lg:hidden h-16 fixed border-b shadow
    dark:text-white 
  ${
    isOpen
      ? " w-full h-[99dvh] overflow-x-hidden overflow-y-auto flex-wrap bg-white dark:text-white "
      : ""
  }
   transition-all duration-500 ease-in-out
  `}
    >
      <div
        className={`w-full max-w-7xl mx-auto flex items-center justify-between gap-10 flex-shrink-0
      ${isOpen ? "flex-wrap" : ""}
      transition-all duration-500 ease-in-out
      `}
      >
        <Link
          href={"/"}
          className="font-extrabold tracking-tight text-3xl capitalize lg:hidden"
        >
          {siteName}.
        </Link>

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

        {isOpen && (
          <div
            className="w-full flex flex-col items-start gap-6 transition-all 
          duration-500 ease-in-out"
          >
            {/* links */}
            <div className="w-full flex flex-1 flex-col gap-4 2xl:mt-2">
              {SellerLinksPage.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex gap-4 items-center  border-y-2 
            justify-start w-full transition-all duration-500 ease-in-out
           py-3
             ${
               pathname.includes(link.path)
                 ? "border-y-2 border-gray-300"
                 : "border-transparent"
             }
             hover:opacity-70
             `}
                >
                  <link.icon className="w-8 flex-shrink-0" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            <div className="w-full flex flex-col items-start justify-start gap-4 flex-shrink-0 pt-6 border-t-2">
              {/* <Link
                href={"/"}
                onClick={() => setIsOpen(false)}
                className={`flex gap-4 items-center  border-y-2 
            justify-start w-full transition-all duration-500 ease-in-out
           py-4
             ${
               pathname.includes("/help")
                 ? "border-y-3 border-gray-300"
                 : "border-transparent"
             }
             hover:opacity-70
             `}
              >
                <Info className="w-8 flex-shrink-0" />
                <span>{"Help"}</span>
              </Link>

              <Link
                href={"/blog"}
                onClick={() => setIsOpen(false)}
                className={`flex gap-4 items-center  border-y-2 
            justify-start w-full transition-all duration-500 ease-in-out
           py-4
             ${
               pathname.includes("/help")
                 ? "border-y-3 border-gray-300"
                 : "border-transparent"
             }
             hover:opacity-70
             `}
              >
                <Newspaper className="w-8 flex-shrink-0" />
                <span>{"Blog"}</span>
              </Link> */}
              {/* avatar */}
              {user && (
                <Link
                  href={"/profile"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-start gap-2"
                >
                  <UserAvatar />
                  <div>
                    <span className="font-bold line-clamp-1">{user?.name}</span>
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {user?.email}
                    </span>
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {returnRole(user?.role)}
                    </span>
                  </div>
                </Link>
              )}
              {user && (
                <Button
                  disabled={loading}
                  onClick={handleLogOut}
                  variant={"destructive"}
                  className="w-full py-5 flex items-center justify-center gap-4"
                >
                  <LogOut className="w-8 flex-shrink-0" />
                  <span>Deconnexion</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderSmallScreen;
