import { prisma } from "@/lib/prisma";
import { modifyShopBySellerSchema } from "@/schema/SellerShopSchema";
import { getUser } from "@/actions/actions";
import { generateSlug, normalizeProductName } from "@/utils/functions";
import { NextResponse } from "next/server";
import { validateShopName } from "@/utils/shopFunctions";
import { NotRecommendedNames } from "@/utils/shopData";

export async function POST(request: Request) {
  try {
    // 🟢 Lecture du body JSON
    const body = await request.json();

    // 🧩 Récupération de l'utilisateur connecté
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { message: "Non autorisé. Veuillez vous connecter.", error: true },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { message: "Votre compte est banni.", error: true },
        { status: 403 }
      );
    }

    // ✅ Validation des données avec Zod
    const validation = modifyShopBySellerSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        path: err.path.join(" > "),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: true,
          message:
            "Erreur de validation des données, veuillez vérifier les champs.",
          details: formattedErrors,
        },
        { status: 400 }
      );
    }

    const revalidated = validation.data;

    // check name shop validity
    const result = validateShopName(revalidated.name, NotRecommendedNames);
    if (result.error) {
      return NextResponse.json(
        { message: result.message, error: true },
        { status: 400 }
      );
    }

    // 🧠 Normalisation du nom et génération du slug
    const name = normalizeProductName(revalidated.name.trim().toLowerCase());
    const slug = generateSlug(revalidated.name);

    // 🔍 Vérification que la boutique existe
    const shopToUpdate = await prisma.shop.findUnique({
      where: { id: revalidated.shopId },
    });

    if (!shopToUpdate) {
      return NextResponse.json(
        { message: "Boutique introuvable.", error: true },
        { status: 404 }
      );
    }

    // 🧍 Vérifier que la boutique appartient bien à l'utilisateur
    if (shopToUpdate.userId !== user.id) {
      return NextResponse.json(
        { message: "Non autorisé à modifier cette boutique.", error: true },
        { status: 403 }
      );
    }

    // 🏪 Vérifier si un autre shop porte déjà ce nom
    const existingShopWithSameName = await prisma.shop.findFirst({
      where: {
        name,
        id: { not: revalidated.shopId },
      },
    });

    if (existingShopWithSameName) {
      return NextResponse.json(
        { message: "Le nom du magasin existe déjà.", error: true },
        { status: 409 }
      );
    }

    // 🛠️ Mise à jour de la boutique
    const updatedShop = await prisma.shop.update({
      where: { id: revalidated.shopId },
      data: {
        name,
        slug,
        description: revalidated.description,
        category: revalidated.category,
        paymentName: revalidated.paymentName,
        paymentPhone: revalidated.paymentPhone,
      },
    });

    return NextResponse.json({
      message: "Boutique modifiée avec succès 🎉",
      data: updatedShop,
      error: false,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Erreur lors de la modification de la boutique :", err);

    return NextResponse.json(
      {
        error: true,
        message: err.message || "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}
