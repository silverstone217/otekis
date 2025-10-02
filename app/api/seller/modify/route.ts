import { prisma } from "@/lib/prisma";
import { modifyShopBySellerSchema } from "@/schema/SellerShopSchema";
import { getUser } from "@/actions/actions";
import { generateSlug, normalizeProductName } from "@/utils/functions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    // ✅ Validation avec safeParse
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
            "Erreur de validation des données, respectez les formats de chaque champ.",
          details: formattedErrors,
        },
        { status: 400 }
      );
    }

    const revalidated = validation.data;

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
      message: "Boutique modifiée avec succès",
      data: shop,
      error: false,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        error: true,
        message: err.message || "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
