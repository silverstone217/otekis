"use client";

import React, { useEffect, useState } from "react";
import { Shop } from "@/lib/generated/prisma/client";
import { Switch } from "@/components/ui/switch";
import { SmoothLink } from "@/components/SmoothLink";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { updateSellerTerms } from "@/actions/shopActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AcceptSellerTermesProps {
  shop: Shop;
}

const AcceptSellerTermes = ({ shop }: AcceptSellerTermesProps) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (acceptTerms) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const result = await updateSellerTerms(shop.id);
          if (result.error) {
            toast.error(
              result.message || "Une erreur est survenue. Veuillez réessayer."
            );
            return;
          }
          toast.success("Merci d'avoir accepté nos termes et conditions !");
          router.refresh();
        } catch (err) {
          console.error(err);
          setAcceptTerms(false); // rollback si erreur
        } finally {
          setLoading(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [acceptTerms, shop.id, router]);

  if (!shop || shop.isSellerTermsAccepted) return null;

  return (
    <Card className="w-full shadow-sm border rounded-2xl">
      <CardContent className="flex items-center justify-between p-6 flex-col md:flex-row gap-4 md:gap-6">
        <div className="space-y-2 text-center md:text-left">
          <Label className="text-lg font-semibold flex items-center gap-2 justify-center md:justify-start">
            <FileText size={18} className="text-muted-foreground" />
            Accepter les termes et conditions
            <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
            Vous devez accepter nos termes et conditions avant de créer une
            boutique.
          </p>
          <SmoothLink href="/conditions-et-termes#boutique">
            <span className="text-blue-500 hover:underline text-sm font-medium">
              Lire les termes et conditions
            </span>
          </SmoothLink>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Switch
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked)}
            disabled={loading}
            aria-label="Accepter les termes et conditions"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AcceptSellerTermes;
