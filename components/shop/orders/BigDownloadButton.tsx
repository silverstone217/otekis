"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, Loader2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  Preferences,
  SupplierArticle,
  SupplierProduct,
} from "@/lib/generated/prisma/client";

type Props = {
  product: SupplierProduct;
  article: SupplierArticle;
  orderId: string;
  orderStatus: string;
  preferences?: Pick<
    Preferences,
    "buttonColor" | "buttonTextColor" | "buttonRadius"
  >;
  /** Lance le téléchargement à chaque chargement / actualisation de la page */
  autoDownload?: boolean;
};

const BLOCKED_STATUSES = ["annulée", "annulé", "en cours de traitement"];

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

export const BigDownloadButton = ({
  product,
  article,
  orderId,
  orderStatus,
  preferences,
  autoDownload = true,
}: Props) => {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const hasAutoDownloaded = useRef(false);

  const canDownload =
    product.category === "digital" &&
    !!article.file &&
    !BLOCKED_STATUSES.includes(orderStatus);

  const accent = preferences?.buttonColor || undefined;
  const accentText = preferences?.buttonTextColor || "#fff";
  const radius = preferences?.buttonRadius;

  const handleDownload = async (isAuto = false) => {
    if (downloading || !canDownload) return;

    const fileName = `${cleanFileName(product.name)}.zip`;
    setDownloading(true);

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

      setDone(true);
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
        description: isAuto
          ? "Cliquez sur le gros bouton « Télécharger mon fichier » pour réessayer."
          : "Vérifiez votre connexion et réessayez.",
      };

      toast.error(msg.title, { id: toastId, description: msg.description });
    } finally {
      setDownloading(false);
    }
  };

  // Téléchargement automatique à chaque montage (donc à chaque F5)
  useEffect(() => {
    if (!autoDownload || !canDownload) return;

    const timer = setTimeout(() => {
      if (hasAutoDownloaded.current) return; // évite le double appel Strict Mode
      hasAutoDownloaded.current = true;
      handleDownload(true);
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, canDownload]);

  if (!canDownload) return null;

  return (
    <section
      style={{ borderRadius: radius }}
      className="border-2 border-emerald-500 bg-emerald-50 p-6 sm:p-8 text-center space-y-5 shadow-lg"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-emerald-700">
          <PartyPopper className="h-6 w-6" />
          <h3 className="text-xl sm:text-2xl font-black">
            Votre fichier est prêt !
          </h3>
        </div>
        <p className="text-sm sm:text-base text-emerald-900">
          Le téléchargement démarre automatiquement. S&apos;il ne démarre pas,
          cliquez sur le bouton ci-dessous.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={() => handleDownload(false)}
        disabled={downloading}
        style={{
          borderRadius: radius,
          ...(accent ? { backgroundColor: accent, color: accentText } : {}),
        }}
        className={cn(
          "w-full sm:w-auto h-16 px-10 text-lg font-black uppercase shadow-xl",
          !accent && "bg-emerald-600 hover:bg-emerald-700 text-white",
          !downloading && !done && "animate-pulse hover:animate-none",
        )}
      >
        {downloading ? (
          <>
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Téléchargement...
          </>
        ) : (
          <>
            <Download className="mr-3 h-6 w-6" />
            {done ? "Télécharger à nouveau" : "Télécharger mon fichier"}
          </>
        )}
      </Button>

      {done && (
        <p className="flex items-center justify-center gap-1 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Fichier téléchargé
        </p>
      )}
    </section>
  );
};

export default BigDownloadButton;
