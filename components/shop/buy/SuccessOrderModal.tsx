"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Preferences } from "@/lib/generated/prisma/client";

type SuccessOrderModalProps = {
  isOpen: boolean;
  orderId: string;
  shopSlug: string;
  openChange: (open: boolean) => void;
  preferences: Preferences;
};

export const SuccessOrderModal = ({
  isOpen,
  orderId,
  shopSlug,
  openChange,
  preferences,
}: SuccessOrderModalProps) => {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-md border-none overflow-hidden p-0 rounded-3xl">
        <div className="relative p-6 flex flex-col items-center text-center space-y-6">
          {/* CÉLÉBRATION VISUELLE */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
            <div className="relative h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Paiement reçu !
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Votre commande{" "}
              <span className="font-mono font-bold text-foreground">
                #{orderId.slice(-6)}
              </span>{" "}
              est en cours de validation.
            </DialogDescription>
          </DialogHeader>

          {/* ACTIONS */}
          <div className="grid w-full gap-3 pt-2">
            <Button
              onClick={() => router.push(`/${shopSlug}/commandes/${orderId}`)}
              className="w-full h-12 text-base font-bold shadow-md transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: preferences.buttonColor,
                color: preferences.buttonTextColor,
                borderRadius: preferences.buttonRadius,
              }}
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              Suivre ma commande
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/${shopSlug}/catalogues`)}
              className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/50"
              style={{
                borderRadius: preferences.buttonRadius,
              }}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continuer mes achats
              <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </div>

          {/* INFO COMPLÉMENTAIRE */}
          <p className="text-[11px] text-muted-foreground italic">
            Un agent vous contactera via WhatsApp au numéro fourni si
            nécessaire.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
