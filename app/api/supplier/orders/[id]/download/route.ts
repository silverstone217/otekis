// app/api/supplier-orders/[id]/download/route.ts
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";

export const maxDuration = 60; // secondes (adapter à ton plan Vercel)

const BLOCKED_STATUSES = ["annulée", "annulé", "en cours de traitement"];

// Nom de fichier propre : on garde le nom du produit, sans caractères interdits
const cleanFileName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "fichier";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1. Authentification
  const user = await getUser();
  if (!user || user.isBanned) {
    return new Response("Non autorisé", { status: 401 });
  }

  // 2. La commande doit appartenir à l'utilisateur
  const order = await prisma.supplierOrder.findUnique({
    where: { id, clientId: user.id },
    select: {
      status: true,
      article: {
        select: {
          file: true,
          Product: { select: { name: true, category: true } },
        },
      },
    },
  });

  if (
    !order ||
    !order.article.file ||
    order.article.Product.category !== "digital"
  ) {
    return new Response("Fichier introuvable", { status: 404 });
  }

  // 3. Statut de la commande
  if (BLOCKED_STATUSES.includes(order.status)) {
    return new Response("Téléchargement indisponible", { status: 403 });
  }

  // 4. Récupération du fichier sur Firebase
  const upstream = await fetch(order.article.file);
  if (!upstream.ok || !upstream.body) {
    return new Response("Fichier introuvable", { status: 404 });
  }

  // 5. Envoi avec le bon nom et le bon type
  const baseName = cleanFileName(order.article.Product.name);
  const asciiName = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "_");

  const headers = new Headers({
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${asciiName}.zip"; filename*=UTF-8''${encodeURIComponent(baseName)}.zip`,
    "Cache-Control": "private, no-store",
  });

  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { headers });
}
