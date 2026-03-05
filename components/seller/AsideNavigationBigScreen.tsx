"use client";
import { SellerLinksPage, siteName } from "@/utils/data";
import { Info, LogOut, Newspaper } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { UserAvatar } from "../home/Header";
import { Button } from "../ui/button";
import { returnRole } from "@/utils/functions";
import { toast } from "sonner";

const AsideNavigationBigScreen = ({
  hasShop,
}: {
  hasShop: { slug: string } | null;
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
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
    <div
      className="w-full h-full flex flex-col px-6 py-6 bg-white
    overflow-y-auto no-horizontal-scrollbar
    "
    >
      {/* Logo */}
      <Link
        href={"/"}
        className="text-2xl font-extrabold tracking-tight capitalize mb-10"
      >
        {siteName}.
      </Link>

      {/* Shop CTA */}
      {hasShop && (
        <Link href={`/${hasShop.slug}`} className="mb-8 block">
          <div
            className="
            rounded-xl px-4 py-4
            bg-neutral-900 text-white
            transition-all duration-300
            hover:bg-black
          "
          >
            <span className="text-xs opacity-70 block">
              Boutique officielle
            </span>
            <span className="font-semibold">Voir ma boutique</span>
          </div>
        </Link>
      )}

      {/* Navigation principale */}
      <div className="flex flex-col gap-1 flex-1">
        {SellerLinksPage.map((link, idx) => {
          const isActive = pathname.includes(link.path);

          return (
            <Link
              key={idx}
              href={link.path}
              className="group relative flex items-center gap-3 px-3 py-3 transition-all"
            >
              {/* Accent bar */}
              <span
                className={`absolute left-0 top-0 h-full w-1 rounded-r-full transition-all
                ${
                  isActive
                    ? "bg-neutral-900"
                    : "bg-transparent group-hover:bg-neutral-300"
                }`}
              />

              <link.icon
                className={`w-5 h-5 transition-all
                ${
                  isActive
                    ? "text-black"
                    : "text-gray-500 group-hover:text-black"
                }`}
              />

              <span
                className={`text-sm transition-all
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

      {/* Bottom section */}
      <div className="pt-6 border-t mt-6 flex flex-col gap-2">
        <Link
          href={"/aide"}
          className="group relative flex items-center gap-3 px-3 py-3 transition-all"
        >
          <Info className="w-5 h-5 text-gray-500 group-hover:text-black transition" />
          <span className="text-sm text-gray-600 group-hover:text-black transition">
            Aide
          </span>
        </Link>

        <Link
          href={"/documentation"}
          className="group relative flex items-center gap-3 px-3 py-3 transition-all"
        >
          <Newspaper className="w-5 h-5 text-gray-500 group-hover:text-black transition" />
          <span className="text-sm text-gray-600 group-hover:text-black transition">
            Documentations
          </span>
        </Link>

        {/* Profile */}
        {user && (
          <>
            <div className="my-4 border-t" />

            <Link
              href={"/profile"}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
            >
              <UserAvatar />
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-sm truncate">
                  {user?.name}
                </span>
                <span className="text-xs text-gray-500 truncate">
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
              className="w-full mt-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Deconnexion
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AsideNavigationBigScreen;
