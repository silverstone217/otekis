"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Download,
  FileArchive,
  Loader2,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  /** Produit fournisseur commandé */
  product: SupplierProduct;
  /** Article commandé (SupplierArticle.file = URL Firebase) */
  article: SupplierArticle;
  /** Id de la commande (sert à appeler la route de téléchargement) */
  orderId: string;
  /** Statut actuel de la commande */
  orderStatus: string;
  /** Style de la boutique (optionnel) */
  preferences?: Pick<
    Preferences,
    "buttonColor" | "buttonTextColor" | "buttonRadius"
  >;
  /** Statuts qui bloquent le téléchargement */
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

// Nom du fichier = nom du produit (sans caractères interdits)
const cleanFileName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "fichier";

const triggerDownload = (href: string, fileName: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const DigitalDownloadCard = ({
  product,
  article,
  orderId,
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
  const style = preferences
    ? {
        borderColor: preferences.buttonColor,
        borderRadius: preferences.buttonRadius,
        buttonColor: preferences.buttonColor,
        buttonTextColor: preferences.buttonTextColor,
      }
    : undefined;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<string[]>([]);

  const isBlocked = blockedStatuses.includes(orderStatus);
  const isDownloading = downloadingId !== null;

  // Le fichier passe par notre serveur : bon nom, bon format, accès vérifié
  const handleDownload = async (item: DownloadableItem, index: number) => {
    if (isDownloading || isBlocked || !item.fileUrl) return;

    const fileName = `${cleanFileName(productName)}${
      items.length > 1 ? ` (${index + 1})` : ""
    }.zip`;

    setDownloadingId(item.id);

    const toastId = toast.loading("Téléchargement en cours...", {
      description: "Ne fermez pas cette page.",
    });

    try {
      const res = await fetch(`/api/supplier/orders/${orderId}/download`);

      if (res.status === 404) throw new Error("NOT_FOUND");
      if (res.status === 403) throw new Error("FORBIDDEN");
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);

      const blob = new Blob([await res.blob()], { type: "application/zip" });
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, fileName);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);

      setDoneIds((prev) => [...prev, item.id]);

      toast.success("Téléchargement terminé", {
        id: toastId,
        description: fileName,
      });
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      const code = error instanceof Error ? error.message : "";

      const messages: Record<string, { title: string; description: string }> = {
        NOT_FOUND: {
          title: "Fichier introuvable",
          description:
            "Ce fichier n'est plus disponible. Contactez le fournisseur.",
        },
        FORBIDDEN: {
          title: "Téléchargement indisponible",
          description:
            "Le téléchargement n'est pas autorisé pour le statut actuel de la commande.",
        },
      };

      const msg = messages[code] ?? {
        title: "Le téléchargement a échoué",
        description: "Vérifiez votre connexion et réessayez.",
      };

      toast.error(msg.title, { id: toastId, description: msg.description });
    } finally {
      setDownloadingId(null);
    }
  };

  if (product.category !== "digital" || !items.length) return null;

  const accent = style?.buttonColor || undefined;

  return (
    <>
      <Card
        style={{
          borderColor: style?.borderColor,
          borderRadius: style?.borderRadius,
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
                Produit numérique au format ZIP, à télécharger depuis cette
                page.
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
              const isThisDownloading = downloadingId === item.id;
              const isDone = doneIds.includes(item.id);
              const unavailable = !item.fileUrl;
              const disabled = isBlocked || isDownloading || unavailable;

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
                        {isDone && !isThisDownloading && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Téléchargé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleDownload(item, index)}
                    disabled={disabled}
                    className="w-full sm:w-auto"
                    style={
                      !disabled && accent
                        ? {
                            backgroundColor: accent,
                            color: style?.buttonTextColor || "#fff",
                          }
                        : undefined
                    }
                  >
                    {isThisDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Téléchargement...
                      </>
                    ) : isBlocked ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Indisponible
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        {isDone ? "Télécharger à nouveau" : "Télécharger"}
                      </>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Verrou plein écran pendant le démarrage du téléchargement */}
      {isDownloading && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-background p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="font-semibold">Téléchargement en cours</p>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>

            <p className="text-xs text-muted-foreground">
              Le fichier est en cours de préparation, ne quittez pas cette page.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DigitalDownloadCard;
