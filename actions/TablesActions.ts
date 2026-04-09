"use server";

import { prisma } from "@/lib/prisma"; // adapte le chemin

import { getUser } from "./actions";
import { Prisma } from "@/lib/generated/prisma/client";

export async function emptyDatabase() {
  try {
    const user = await getUser();

    if (!user || user.role !== "super_admin") {
      return {
        error: true,
        message: "Non autorisé à effectuer cette action !",
      };
    }

    if (process.env.NODE_ENV === "production") {
      return {
        error: true,
        message:
          "Action bloquée en production pour éviter la suppression accidentelle.",
      };
    }

    // Typage explicite pour le paramètre `m`
    const dmmf = (Prisma as any).dmmf;
    const modelNames = dmmf.datamodel.models.map((m: any) => m.name);

    // Typage explicite pour `modelName`
    await Promise.all(
      modelNames.map(async (modelName: string) => {
        // @ts-expect-error : accès dynamique au modèle Prisma
        await prisma[modelName].deleteMany({});
      }),
    );

    console.log(
      "✅ Toutes les données ont été supprimées de la base de données.",
    );
    return {
      error: false,
      message: "Toutes les données ont été supprimées avec succès !",
    };
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    return {
      error: true,
      message: "Impossible d'effectuer cette action.",
    };
  }
}
