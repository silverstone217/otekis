"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth"; // adaptez à votre config Auth.js / NextAuth
import { prisma } from "@/lib/prisma"; // votre instance PrismaClient
import { Prisma } from "@/lib/generated/prisma/client";

type Currency = "USD" | "CDF";

type PayResult =
  | { success: true; historyId: string }
  | { success: false; error: string };

/** Nombre maximum de décimales par devise (= plus petite unité payable). */
const DECIMALS: Record<Currency, number> = { USD: 3, CDF: 2 };

/** Valeur de `role` autorisée à payer. */
const ADMIN_ROLE = ["super_admin", "admin"];

/** Page à rafraîchir après un paiement. */
const REVALIDATE_PATH = "/admin/suppliers";

// Les arguments d'une server action sont du JSON non fiable : on valide tout.
const inputSchema = z.object({
  supplierId: z.string().min(1).max(100),
  currency: z.enum(["USD", "CDF"]),
  amount: z.union([z.number(), z.string()]),
  phone: z.string().min(1).max(30),
});

/** Erreur « métier » dont le message peut être montré à l'utilisateur. */
class PaymentError extends Error {}

const fail = (error: string): PayResult => ({ success: false, error });

function parseAmount(
  raw: number | string,
  currency: Currency,
): { value: Prisma.Decimal } | { error: string } {
  let value: Prisma.Decimal;
  try {
    value = new Prisma.Decimal(
      typeof raw === "number" ? raw.toString() : raw.trim().replace(",", "."),
    );
  } catch {
    return { error: "Montant invalide." };
  }

  if (!value.isFinite()) return { error: "Montant invalide." };
  if (value.lte(0)) {
    return { error: "Le montant doit être supérieur à zéro." };
  }
  if (value.decimalPlaces() > DECIMALS[currency]) {
    return {
      error: `Le montant ne peut pas avoir plus de ${DECIMALS[currency]} décimales en ${currency}.`,
    };
  }
  return { value };
}

/** Normalise vers le format international (+243… par défaut pour la RDC). */
function normalizePhone(raw: string): string | null {
  let p = raw.replace(/[\s().-]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  else if (/^0\d{9}$/.test(p)) p = "+243" + p.slice(1);
  else if (/^[89]\d{8}$/.test(p)) p = "+243" + p;
  else if (/^243\d{9}$/.test(p)) p = "+" + p;
  return /^\+\d{9,15}$/.test(p) ? p : null;
}

/** Taux du jour (1 USD = X CDF). À remplacer par votre source (table, API…). */
// function getExchangeRate(): number {
//   const rate = Number(process.env.USD_TO_CDF_RATE);
//   if (!Number.isFinite(rate) || rate <= 0) {
//     throw new PaymentError("Le taux de change n’est pas configuré.");
//   }
//   return rate;
// }

export async function paySupplier(input: unknown): Promise<PayResult> {
  // 1. Authentification + autorisation (rôle relu en base, pas dans le client)
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) return fail("Vous devez être connecté.");

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { role: true, isBanned: true },
  });
  if (!admin || admin.isBanned || !ADMIN_ROLE.includes(admin.role)) {
    console.log("role", admin?.role);
    return fail("Action réservée aux administrateurs.");
  }

  // 2. Validation des entrées
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return fail("Données invalides.");
  const { supplierId, currency } = parsed.data;

  const amountResult = parseAmount(parsed.data.amount, currency);
  if ("error" in amountResult) return fail(amountResult.error);
  const amount = amountResult.value;

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return fail("Numéro de téléphone invalide.");

  // 3. Débit atomique + historique dans une seule transaction
  try {
    const prefs = await prisma.otekisPreferences.findFirst({
      select: { exchangeRate: true },
    });

    const exchange = prefs?.exchangeRate ?? 1;

    const history = await prisma.$transaction(async (tx) => {
      const supplier = await tx.user.findUnique({
        where: { id: supplierId },
        select: { id: true, name: true },
      });
      if (!supplier) throw new PaymentError("Fournisseur introuvable.");

      // Le `gte` est évalué par la base au moment de l'UPDATE : impossible de
      // passer en négatif, même avec deux paiements simultanés.
      const debit =
        currency === "USD"
          ? await tx.user.updateMany({
              where: { id: supplierId, supplierBenefitAmount: { gte: amount } },
              data: { supplierBenefitAmount: { decrement: amount } },
            })
          : await tx.user.updateMany({
              where: {
                id: supplierId,
                supplierBenefitAmountCDF: { gte: amount },
              },
              data: { supplierBenefitAmountCDF: { decrement: amount } },
            });

      if (debit.count !== 1) {
        throw new PaymentError("Solde insuffisant pour ce montant.");
      }

      return tx.supplierWithdrawalHistory.create({
        data: {
          supplierId,
          amount,
          currency,
          exchange,
          status: "non-traité",
          paymentPhone: phone,
          paymentName: supplier.name?.trim() || "Sans nom",
          createdById: adminId,
        },
        select: { id: true },
      });
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true, historyId: history.id };
  } catch (error) {
    if (error instanceof PaymentError) return fail(error.message);
    console.error("[paySupplier]", error);
    return fail("Une erreur est survenue. Aucun montant n’a été débité.");
  }
}
