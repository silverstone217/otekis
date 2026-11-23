"use client";

import React, { useEffect, useRef } from "react";
import { CheckCircle2, Download, Loader2, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFileDownload, type DownloadMode } from "./useFileDownload";
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
  autoDownload?: boolean;
  /** "native" = onglet téléchargements du navigateur, "stream" = progression + annulation dans la page */
  mode?: DownloadMode;
};

const BLOCKED_STATUSES = ["annulée", "annulé", "en cours de traitement"];

export const BIG_DOWNLOAD_ID = "big-download-button";
export const START_BIG_DOWNLOAD_EVENT = "start-big-download";

const cleanFileName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "fichier";

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export const BigDownloadButton = ({
  product,
  article,
  orderId,
  orderStatus,
  preferences,
  autoDownload = true,
  mode = "native",
}: Props) => {
  const canDownload =
    product.category === "digital" &&
    !!article.file &&
    !BLOCKED_STATUSES.includes(orderStatus);

  const { state, loaded, total, percent, start, cancel } = useFileDownload({
    url: `/api/supplier/orders/${orderId}/download`,
    fileName: `${cleanFileName(product.name)}.zip`,
    mode,
  });

  const accent = preferences?.buttonColor || undefined;
  const accentText = preferences?.buttonTextColor || "#fff";
  const radius = preferences?.buttonRadius;

  const isDownloading = state === "downloading";
  const finished = state === "done" || state === "started";

  const sectionRef = useRef<HTMLElement | null>(null);

  // Téléchargement automatique à chaque montage (donc à chaque F5)
  const hasAutoDownloaded = useRef(false);
  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    if (!autoDownload || !canDownload) return;
    const timer = setTimeout(() => {
      if (hasAutoDownloaded.current) return;
      hasAutoDownloaded.current = true;
      startRef.current();
    }, 600);
    return () => clearTimeout(timer);
  }, [autoDownload, canDownload]);

  // Écoute la demande venant de DigitalDownloadCard :
  // on défile vers le gros bouton, puis on lance le téléchargement
  useEffect(() => {
    const handler = () => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // start() ignore déjà l'appel si un téléchargement est en cours
      startRef.current();
    };
    window.addEventListener(START_BIG_DOWNLOAD_EVENT, handler);
    return () => window.removeEventListener(START_BIG_DOWNLOAD_EVENT, handler);
  }, []);

  if (!canDownload) return null;

  return (
    <section
      id={BIG_DOWNLOAD_ID}
      ref={sectionRef}
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

      {/* Bouton principal */}
      <Button
        type="button"
        size="lg"
        onClick={start}
        disabled={isDownloading}
        style={{
          borderRadius: radius,
          ...(accent ? { backgroundColor: accent, color: accentText } : {}),
        }}
        className={cn(
          "w-full sm:w-auto h-16 px-10 text-lg font-black uppercase shadow-xl",
          !accent && "bg-emerald-600 hover:bg-emerald-700 text-white",
          state === "idle" && "animate-pulse hover:animate-none",
        )}
      >
        {isDownloading ? (
          <>
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Téléchargement...
          </>
        ) : (
          <>
            <Download className="mr-3 h-6 w-6" />
            {finished ? "Télécharger à nouveau" : "Télécharger mon fichier"}
          </>
        )}
      </Button>

      {/* Progression + annulation (mode stream) */}
      {isDownloading && (
        <div className="mx-auto max-w-md space-y-3">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent ?? undefined}
            className="h-3 w-full overflow-hidden rounded-full bg-emerald-200"
          >
            {percent !== null ? (
              <div
                className="h-full rounded-full bg-emerald-600 transition-[width] duration-150"
                style={{ width: `${percent}%` }}
              />
            ) : (
              // Taille inconnue : barre indéterminée
              <div className="h-full w-1/3 animate-pulse rounded-full bg-emerald-600" />
            )}
          </div>

          <p className="text-sm font-medium text-emerald-900">
            {percent !== null
              ? `${percent}% • ${formatBytes(loaded)} / ${formatBytes(total)}`
              : `${formatBytes(loaded)} téléchargés`}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={cancel}
            className="border-rose-300 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <X className="mr-2 h-4 w-4" />
            Annuler le téléchargement
          </Button>
        </div>
      )}

      {/* Messages d'état */}
      {state === "started" && (
        <p className="text-sm text-emerald-800">
          Le téléchargement est en cours dans votre navigateur. Suivez sa
          progression (ou annulez-le) dans la barre des téléchargements.
        </p>
      )}
      {state === "done" && (
        <p className="flex items-center justify-center gap-1 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Fichier téléchargé
        </p>
      )}
      {state === "cancelled" && (
        <p className="text-sm text-amber-700">
          Téléchargement annulé. Vous pouvez le relancer quand vous voulez.
        </p>
      )}
    </section>
  );
};

export default BigDownloadButton;
