"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AlignJustify, Info, LogOut, Newspaper, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { SellerLinksPage, siteName } from "@/utils/data";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "../home/Header";
import { returnRole } from "@/utils/functions";
import { Button } from "../ui/button";
import { toast } from "sonner";

const HeaderSmallScreen = ({
  hasShop,
}: {
  hasShop: { slug: string } | null;
}) => {
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
      setIsOpen(false);
      router.refresh();
    } catch (error) {
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
      className={`fixed top-0 left-0 w-full z-50 lg:hidden
      bg-white/80 backdrop-blur-xl border-b
      transition-all duration-300
      ${isOpen ? "h-dvh" : "h-16"}
      `}
    >
      <div
        className={`max-w-7xl mx-auto h-16 px-4
        flex items-center justify-between
        `}
      >
        {/* Logo */}
        <Link
          href={"/"}
          className="text-2xl font-extrabold tracking-tight capitalize"
        >
          {siteName}.
        </Link>

        {/* Toggle */}
        <button
          onClick={toggleMenu}
          className="w-10 h-10 flex items-center justify-center
          rounded-xl hover:bg-gray-100 transition"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <AlignJustify className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Fullscreen Menu */}
      {isOpen && (
        <div className="px-6 pt-6 pb-10 overflow-y-auto h-[calc(100dvh-4rem)] flex flex-col">
          {/* Shop CTA */}
          {hasShop && (
            <Link
              href={`/${hasShop.slug}`}
              onClick={() => setIsOpen(false)}
              className="mb-8 block"
            >
              <div
                className="
    relative overflow-hidden rounded-2xl p-5
    bg-linear-to-br from-black to-gray-800
    text-white
    transition-all duration-300
    hover:scale-[1.02]
    active:scale-[0.98]
  "
              >
                <div className="flex flex-col">
                  <span className="text-xs opacity-70">
                    Visiter votre boutique officielle
                  </span>
                  <span className="text-lg font-semibold">
                    Voir ma boutique
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col">
            {SellerLinksPage.map((link, idx) => {
              const isActive = pathname.includes(link.path);

              return (
                <Link
                  key={idx}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center gap-4 px-4 py-4
        transition-all duration-300`}
                >
                  {/* Accent bar */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-r-full transition-all duration-300
          ${isActive ? "bg-black" : "bg-transparent group-hover:bg-gray-300"}`}
                  />

                  <link.icon
                    className={`w-5 h-5 transition-all duration-300
          ${isActive ? "text-black" : "text-gray-500 group-hover:text-black"}`}
                  />

                  <span
                    className={`transition-all duration-300
          ${
            isActive
              ? "font-semibold text-black"
              : "text-gray-600 group-hover:text-black"
          }`}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-8 border-t" />

          {/* Secondary Links */}
          <div className="flex flex-col gap-2">
            <Link
              href={"/aide"}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition
              ${
                pathname.includes("/aide")
                  ? "bg-gray-100 font-medium"
                  : "hover:bg-gray-50"
              }
              `}
            >
              <Info className="w-5 h-5 opacity-80" />
              <span>Aide</span>
            </Link>

            <Link
              href={"/documentation"}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition
              ${
                pathname.includes("/documentation")
                  ? "bg-gray-100 font-medium"
                  : "hover:bg-gray-50"
              }
              `}
            >
              <Newspaper className="w-5 h-5 opacity-80" />
              <span>Documentations</span>
            </Link>
          </div>

          {/* Profile Section */}
          {user && (
            <>
              <div className="my-8 border-t" />

              <Link
                href={"/profile"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
              >
                <UserAvatar />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold truncate">{user?.name}</span>
                  <span className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </span>
                  <span className="text-xs text-gray-400">
                    {returnRole(user?.role)}
                  </span>
                </div>
              </Link>

              <Button
                disabled={loading}
                onClick={handleLogOut}
                variant="destructive"
                className="mt-4 w-full rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Deconnexion
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default HeaderSmallScreen;
