"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// interface AuthPopupProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

export function AuthPopup() {
  const [loading, setLoading] = useState<
    "google" | "facebook" | "apple" | null
  >(null);

  const handleSignIn = async (provider: "google" | "facebook" | "apple") => {
    setLoading(provider);
    try {
      await signIn(provider, { redirect: false });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Connexion</Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm w-full rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Connexion requise
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Connecte-toi pour continuer. Seule la connexion Google est
            disponible pour le moment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleSignIn("google")}
            disabled={loading !== null}
          >
            {loading === "google" ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <FcGoogle className="w-5 h-5" />
            )}
            Continuer avec Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 opacity-60"
            disabled
          >
            <FaApple className="w-5 h-5" />
            Continuer avec Apple
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 opacity-60"
            disabled
          >
            <FaFacebookF className="w-5 h-5" />
            Continuer avec Facebook
          </Button>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="ghost" className="w-full">
              Annuler
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
