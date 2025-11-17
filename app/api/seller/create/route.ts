import { prisma } from "@/lib/prisma";
import { addShopBySellerSchema } from "@/schema/SellerShopSchema";
import { getUser } from "@/actions/actions";
import { generateSlug, normalizeProductName } from "@/utils/functions";
import { NextResponse } from "next/server";
import { validateShopName } from "@/utils/shopFunctions";
import { NotRecommendedNames } from "@/utils/shopData";

const PERMIT_ROLES = ["employe", "employee", "admin", "super_admin"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🧩 Authentification
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

    // ✅ Validation avec Zod
    const validation = addShopBySellerSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        path: err.path.join(" > "),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: true,
          message:
            "Erreur de validation des données. Veuillez vérifier les champs.",
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

    // 🧠 Normalisation et slugification
    const name = normalizeProductName(revalidated.name.trim().toLowerCase());

    // 🔍 Vérification si une boutique existe déjà avec ce nom
    const existingShop = await prisma.shop.findFirst({
      where: { name },
    });

    if (existingShop) {
      return NextResponse.json(
        { message: "Le nom du magasin existe déjà.", error: true },
        { status: 409 }
      );
    }

    // 🔁 Assurer un slug unique
    const slug = generateSlug(name);
    const existingSlug = await prisma.shop.findFirst({
      where: {
        slug,
      },
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          message: "probleme de configuration, utliser un autre nom.",
          error: true,
        },
        { status: 409 }
      );
    }

    // 🎭 Déterminer le rôle
    const role = PERMIT_ROLES.includes(user.role) ? user.role : "seller";

    // 🏪 Création de la boutique
    const shop = await prisma.shop.create({
      data: {
        name,
        slug,
        description: revalidated.description,
        logo: revalidated.logo,
        cover: revalidated.cover,
        category: revalidated.category,
        paymentName: revalidated.paymentName,
        paymentPhone: revalidated.paymentPhone,
        isSellerTermsAccepted: revalidated.isSellerTermsAccepted,
        user: {
          connect: { id: user.id },
        },
      },
    });

    // 🔄 Mise à jour du rôle utilisateur si nécessaire
    await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });

    return NextResponse.json({
      message: "Boutique créée avec succès 🎉",
      data: shop,
      error: false,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Erreur lors de la création de la boutique :", err);

    return NextResponse.json(
      {
        error: true,
        message: err.message || "Erreur interne du serveur.",
      },
      { status: 500 }
    );
  }
}
