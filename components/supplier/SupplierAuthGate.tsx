"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Store,
  Package,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

const SupplierAuthGate = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signIn("google", {
        callbackUrl: "/fournisseurs",
      });
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* LOGO / ICON SECTION */}
        <div className="relative mb-8">
          <div className="h-20 w-20 rounded-4xl bg-primary/5 flex items-center justify-center border border-primary/10 rotate-3 transition-transform hover:rotate-0 duration-500">
            <Store className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border shadow-sm flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>

        {/* TEXT CONTENT */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Espace Fournisseur
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[320px] mx-auto">
            Gérez votre inventaire et vos ventes en toute simplicité sur notre
            plateforme.
          </p>
        </div>

        {/* FEATURE HIGHLIGHTS (Minimalist horizontal list or hidden in subtil layout) */}
        <div className="w-full space-y-4 mb-8">
          {[
            { icon: Package, text: "Gestion d'inventaire" },
            { icon: ShoppingCart, text: "Suivi des commandes" },
            { icon: Store, text: "Boutiques partenaires" },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-muted/50 hover:bg-muted/20 transition-all duration-300 group"
            >
              <div className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <feature.icon
                  className="h-4 w-4 text-muted-foreground group-hover:text-primary"
                  strokeWidth={2}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA SECTION */}
        <div className="w-full space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 text-sm font-medium rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Continuer avec Google</span>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </div>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-px w-8 bg-muted" />
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Accès Sécurisé
            </p>
            <div className="h-px w-8 bg-muted" />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-12">
          <p className="text-xs text-muted-foreground/60">
            En continuant, vous acceptez nos conditions d'utilisation.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SupplierAuthGate;
