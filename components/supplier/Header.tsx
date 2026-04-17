"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/UserAuth";
import { UserAvatar } from "../home/Header";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const user = useCurrentUser();
  const pathname = usePathname();
  const isAddingProduct = pathname === "/fournisseurs";

  return (
    <div
      className="sticky top-0 z-50 w-full border-b bg-background/80 
    backdrop-blur-md"
    >
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        {/* RETOUR & NAVIGATION */}
        <div className="flex items-center gap-4">
          <Link
            href={!isAddingProduct ? "/fournisseurs" : "/"}
            className="group flex items-center justify-center h-10 w-10 
            rounded-full border bg-background hover:bg-muted transition-all 
            duration-200"
          >
            <ArrowLeft
              className="h-5 w-5 group-hover:-translate-x-0.5 
            transition-transform"
            />
          </Link>
          <div className="hidden sm:block h-6 w-px bg-border" />
          <h1 className="text-md sm:text-lg font-semibold tracking-tight">
            Espace Fournisseur
          </h1>
        </div>

        {/* PROFIL & ACTIONS */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 p-1 pr-3 rounded-full 
              border bg-muted/30 hover:bg-muted/50 transition-all outline-none 
              focus:ring-2 focus:ring-primary/10"
              >
                <UserAvatar />
                <div className="hidden md:flex flex-col items-start mr-1">
                  <span className="text-xs font-semibold leading-none">
                    {user.name?.split(" ")[0]}
                  </span>
                  <span
                    className="text-[10px] text-primary font-medium flex 
                  items-center gap-1"
                  >
                    <Sparkles className="h-2.5 w-2.5" /> Pro
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-72 mt-2 p-2 rounded-2xl shadow-xl border-muted/60"
              align="end"
            >
              {/* EN-TÊTE UTILISATEUR */}
              <div
                className="flex items-center gap-3 p-3 mb-2 rounded-xl 
              bg-muted/40"
              >
                <UserAvatar />
                <div className="flex flex-col">
                  <span
                    className="text-sm font-bold text-foreground truncate 
                  max-w-40"
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-[11px] text-muted-foreground truncate 
                  max-w-40"
                  >
                    {user.email}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-3 p-2.5 rounded-lg 
                  opacity-50 cursor-not-allowed"
                >
                  <div
                    className="h-8 w-8 rounded-md bg-muted flex 
                  items-center justify-center"
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Mon Profil</span>
                    <span className="text-[10px] text-muted-foreground">
                      Modifier vos informations
                    </span>
                  </div>
                  <span
                    className="ml-auto text-[9px] bg-primary/10 
                  text-primary px-1.5 py-0.5 rounded-full font-bold"
                  >
                    SOON
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-3 p-2.5 rounded-lg opacity-50 
                  cursor-not-allowed"
                >
                  <div
                    className="h-8 w-8 rounded-md bg-muted flex items-center 
                  justify-center"
                  >
                    <Settings className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Paramètres</span>
                    <span className="text-[10px] text-muted-foreground">
                      Préférences du compte
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-2" />

              <div
                className="px-2 py-1.5 flex items-center gap-2 text-[10px] 
              text-muted-foreground/70 uppercase font-bold tracking-widest"
              >
                <ShieldCheck className="h-3 w-3" /> Compte sécurisé
              </div>

              <DropdownMenuSeparator className="my-2" />

              {/* BOUTON DECONNEXION */}
              <DropdownMenuItem
                className="flex items-center gap-3 p-2.5 rounded-lg 
                text-destructive 
                focus:bg-destructive/5 focus:text-destructive cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/fournisseurs" })}
              >
                <div
                  className="h-8 w-8 rounded-md bg-destructive/10 flex 
                items-center 
                justify-center"
                >
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default Header;
