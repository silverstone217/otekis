"use client";
import { AdminLinksPage, siteName } from "@/utils/data";
import { Info, LogOut, Newspaper } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { UserAvatar } from "../home/Header";
import { Button } from "../ui/button";
import { returnRoleWith } from "@/utils/functions";
import { toast } from "sonner";
// import { useOrderCount } from "./clients-orders/OrderCountContext";
import { Badge } from "../ui/badge";
import { useOrderCountRealtime } from "./clients-orders/OrderCountPusher";
type Props = {
  initialCount: number;
};

const AsideNavigationBigScreen = ({ initialCount }: Props) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const count = useOrderCountRealtime(initialCount);

  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      router.refresh();
    } catch (error) {
      // console.error("Failed to log out", error);
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
      className="h-full hidden lg:flex flex-col
    transition-all duration-500 ease-in-out w-full
     gap-10 overflow-x-hidden overflow-y-auto py-4 relative"
    >
      {/* logo */}
      <Link
        href={"/"}
        className="text-black px-4 
           text-3xl font-extrabold flex-shrink-0 capitalize"
      >
        {siteName}.
      </Link>
      {/* <div className="py-10" /> */}
      {/* links */}
      <div className="w-full flex flex-1 flex-col gap-4 px-4">
        {AdminLinksPage.filter((lk) =>
          user ? lk.roles.includes(user?.role) : lk.roles.length === 3
        ).map((link, idx) => (
          <Link
            key={idx}
            href={link.path}
            className={`flex gap-4 items-center border-y-2 justify-start w-full 
              transition-all duration-500 ease-in-out py-3 ${
                pathname.includes(link.path)
                  ? "border-y-2 border-gray-300"
                  : "border-transparent"
              } hover:opacity-70 relative
            `}
          >
            <link.icon className="w-8 flex-shrink-0" />
            <span>{link.name}</span>

            {user &&
              link.name.toLowerCase().includes("traitement et commandes") &&
              count > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs shadow"
                  variant="destructive"
                >
                  {count < 100 ? count : "99+"}
                </Badge>
              )}
          </Link>
        ))}
        {/* Super Admin only */}
        {/* {user?.role === "super_admin" && (
          <>
            {AdminLinksPage.filter((lk) => lk.path.includes("/admins")).map(
              (link, idx) => (
                <Link
                  key={idx}
                  href={link.path}
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
              )
            )}
          </>
        )} */}
      </div>

      {/* <div className="py-10" /> */}
      {/* profile */}
      <div
        className="w-full flex flex-col items-start justify-start gap-4 
      flex-shrink-0 pt-2 border-t-2 px-4"
      >
        <Link
          href={"/"}
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
        </Link>
        {/* avatar */}
        {user && (
          <Link
            href={"/profile"}
            className="flex items-center justify-start gap-2"
          >
            <UserAvatar />
            <div>
              <span className="font-bold line-clamp-1">{user?.name}</span>
              <span className="text-sm text-gray-500 line-clamp-1">
                {user?.email}
              </span>
              <span className="text-sm text-gray-500 line-clamp-1">
                {returnRoleWith(user?.role)}
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
  );
};

export default AsideNavigationBigScreen;
