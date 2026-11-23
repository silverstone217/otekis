"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type DownloadMode = "native" | "stream";
export type DownloadState =
  | "idle"
  | "downloading"
  | "started" // mode native : le navigateur a pris le relais
  | "done"
  | "cancelled"
  | "error";

type Options = {
  url: string;
  fileName: string;
  mode?: DownloadMode;
};

const triggerDownload = (href: string, fileName: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const ERRORS: Record<string, { title: string; description: string }> = {
  NOT_FOUND: {
    title: "Fichier introuvable",
    description: "Ce fichier n'est plus disponible. Contactez le fournisseur.",
  },
  FORBIDDEN: {
    title: "Téléchargement indisponible",
    description:
      "Le téléchargement n'est pas autorisé pour le statut actuel de la commande.",
  },
};

export function useFileDownload({ url, fileName, mode = "native" }: Options) {
  const [state, setState] = useState<DownloadState>("idle");
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Annule proprement si on quitte la page
  useEffect(() => () => abortRef.current?.abort(), []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const start = useCallback(async () => {
    if (state === "downloading") return;

    // ── MODE NATIVE : le navigateur gère tout (onglet téléchargements) ──
    if (mode === "native") {
      triggerDownload(url, fileName);
      setState("started");
      return;
    }

    // ── MODE STREAM : progression + annulation dans la page ──
    const controller = new AbortController();
    abortRef.current = controller;
    setState("downloading");
    setLoaded(0);
    setTotal(0);

    try {
      const res = await fetch(url, { signal: controller.signal });

      if (res.status === 404) throw new Error("NOT_FOUND");
      if (res.status === 403) throw new Error("FORBIDDEN");
      if (!res.ok || !res.body) throw new Error(`HTTP_${res.status}`);

      const length = Number(res.headers.get("Content-Length")) || 0;
      setTotal(length);

      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;
      let lastUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;

        // On limite les re-rendus (toutes les ~100 ms)
        const now = performance.now();
        if (now - lastUpdate > 100) {
          lastUpdate = now;
          setLoaded(received);
        }
      }
      setLoaded(received);

      const blob = new Blob(chunks, { type: "application/zip" });
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, fileName);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);

      setState("done");
      toast.success("Téléchargement terminé", { description: fileName });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setState("cancelled");
        toast.info("Téléchargement annulé");
        return;
      }
      console.error("Erreur téléchargement:", error);
      const code = error instanceof Error ? error.message : "";
      const msg = ERRORS[code] ?? {
        title: "Le téléchargement a échoué",
        description: "Vérifiez votre connexion et réessayez.",
      };
      setState("error");
      toast.error(msg.title, { description: msg.description });
    } finally {
      abortRef.current = null;
    }
  }, [state, mode, url, fileName]);

  const percent =
    total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null;

  return { state, loaded, total, percent, start, cancel };
}
