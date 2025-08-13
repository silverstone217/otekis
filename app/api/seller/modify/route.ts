import { prisma } from "@/lib/prisma";
import { modifyShopBySellerSchema } from "@/schema/SellerShopSchema";
import { getUser } from "@/actions/actions";
import { generateSlug, normalizeProductName } from "@/utils/functions";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized", error: true },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { message: "Votre compte est banni", error: true },
        { status: 403 }
      );
    }

    const revalidated = await modifyShopBySellerSchema.parse(body);

    const name = normalizeProductName(revalidated.name.trim().toLowerCase());
    const slug = generateSlug(revalidated.name);

    const isShopWithThatNameExists = await prisma.shop.findUnique({
      where: { name },
    });

    if (
      isShopWithThatNameExists &&
      isShopWithThatNameExists.id !== revalidated.shopId
    ) {
      return NextResponse.json(
        { message: "Le nom du magasin existe déjà", error: true },
        { status: 409 }
      );
    }

    const shop = await prisma.shop.update({
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
      message: "Boutique modifiéé avec succès",
      data: shop,
      error: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Gère les erreurs de validation Zod
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join(" > "), // Chemin de l'erreur dans l'objet de données
        message: err.message, // Message d'erreur
      }));

      console.log({ formattedErrors });

      // Retourner les erreurs de validation Zod
      return NextResponse.json(
        {
          error: true,
          message:
            "Erreur de validation des données, respectez les formats de chaque champs!",
          details: formattedErrors,
        },
        { status: 400 }
      );
    }

    const err = error as Error;
    return NextResponse.json(
      {
        error: true,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
