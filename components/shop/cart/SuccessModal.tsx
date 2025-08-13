"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Shop } from "@prisma/client";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: Shop;
}

export function SuccessModal({ open, onOpenChange, shop }: SuccessModalProps) {
  const router = useRouter();
  const shopUrl = `/${shop.slug}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        router.refresh();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="flex flex-col items-center space-y-2">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
          <DialogTitle className="text-center text-2xl font-semibold">
            Paiement réussi !
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground max-w-xs">
            Votre commande a été validée avec succès.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter
          className="flex flex-col sm:flex-row sm:justify-center 
        sm:space-x-4 space-y-3 sm:space-y-0 mt-6"
        >
          <Button
            onClick={() => {
              router.push(`${shopUrl}/commandes`);
              router.refresh();
            }}
            className="w-full sm:w-auto"
          >
            Voir mes commandes
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              router.refresh();
              // router.push(`${shopUrl}/commandes`);
            }}
            className="w-full sm:w-auto"
          >
            Continuer mes achats
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              router.push(`${shopUrl}/catalogues`);
              router.refresh();
            }}
            className="w-full sm:w-auto"
          >
            {`Voir d'autres articles`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
