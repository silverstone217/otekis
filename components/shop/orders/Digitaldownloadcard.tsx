"use client";

import React from "react";
import { Download, FileArchive, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { START_BIG_DOWNLOAD_EVENT } from "./BigDownloadButton";
import type {
  Preferences,
  SupplierArticle,
  SupplierProduct,
} from "@/lib/generated/prisma/client";

type DownloadableItem = {
  id: string;
  label?: string | null;
  fileUrl: string | null;
};

type DigitalDownloadCardProps = {
  product: SupplierProduct;
  article: SupplierArticle;
  orderId: string;
  orderStatus: string;
  preferences?: Pick<
    Preferences,
    "buttonColor" | "buttonTextColor" | "buttonRadius"
  >;
  blockedStatuses?: string[];
  className?: string;
};

const DEFAULT_BLOCKED = ["annulée", "annulé", "en cours de traitement"];

const BLOCKED_MESSAGES: Record<string, string> = {
  "en cours de traitement":
    "Le téléchargement sera disponible dès que le fournisseur aura validé votre commande.",
  annulée:
    "Cette commande a été annulée : le téléchargement n'est plus possible.",
  annulé:
    "Cette commande a été annulée : le téléchargement n'est plus possible.",
};

export const DigitalDownloadCard = ({
  product,
  article,
  orderStatus,
  preferences,
  blockedStatuses = DEFAULT_BLOCKED,
  className,
}: DigitalDownloadCardProps) => {
  const productName = product.name;
  const items: DownloadableItem[] = [
    {
      id: article.id,
      label: article.commandNumber ? `Réf. ${article.commandNumber}` : null,
      fileUrl: article.file,
    },
  ];

  const isBlocked = blockedStatuses.includes(orderStatus);

  // Délègue au gros bouton : il défile jusqu'à lui et lance le téléchargement
  const handleDownload = () => {
    if (isBlocked) return;
    window.dispatchEvent(new Event(START_BIG_DOWNLOAD_EVENT));
  };

  if (product.category !== "digital" || !items.length) return null;

  const accent = preferences?.buttonColor || undefined;
  const accentText = preferences?.buttonTextColor || "#fff";

  return (
    <Card
      style={{
        borderColor: accent,
        borderRadius: preferences?.buttonRadius,
      }}
      className={cn("border shadow-sm overflow-hidden", className)}
    >
      <CardContent className="p-0">
        {/* En-tête */}
        <div className="flex items-start gap-4 p-5 sm:p-6 border-b bg-muted/30">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileArchive className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight">
              {items.length > 1 ? "Vos fichiers" : "Votre fichier"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Produit numérique au format ZIP. Le bouton ci-dessous lance le
              téléchargement en haut de la page.
            </p>
          </div>
        </div>

        {/* Bandeau de blocage */}
        {isBlocked && (
          <div
            role="status"
            className="flex items-start gap-3 border-b bg-amber-50 px-5 py-3 text-sm text-amber-800 sm:px-6"
          >
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {BLOCKED_MESSAGES[orderStatus] ??
                "Le téléchargement n'est pas disponible pour le moment."}
            </p>
          </div>
        )}

        {/* Liste des fichiers */}
        <ul className="divide-y">
          {items.map((item, index) => {
            const unavailable = !item.fileUrl;
            const disabled = isBlocked || unavailable;

            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background text-xs font-semibold text-muted-foreground">
                    ZIP
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium capitalize">
                      {items.length > 1
                        ? `${productName} (${index + 1})`
                        : productName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {item.label && (
                        <Badge variant="secondary" className="font-normal">
                          {item.label}
                        </Badge>
                      )}
                      {unavailable && !isBlocked && (
                        <Badge variant="outline" className="font-normal">
                          Fichier indisponible
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleDownload}
                  disabled={disabled}
                  className="w-full sm:w-auto"
                  style={
                    !disabled && accent
                      ? { backgroundColor: accent, color: accentText }
                      : undefined
                  }
                >
                  {isBlocked ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Indisponible
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Télécharger
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DigitalDownloadCard;
