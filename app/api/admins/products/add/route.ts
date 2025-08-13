import { prisma } from "@/lib/prisma";
import { addProductByAdminSchema } from "@/schema/productSchema";
import { getUser } from "@/actions/actions";
import {
  calculateTotalPrice,
  generateDigitNumber,
  generateSlug,
  normalizeProductName,
} from "@/utils/functions";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PERMITED_ROLES } from "@/utils/dataAdd";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized", error: true, data: null },
        { status: 401 }
      );
    }

    const isPermitted = PERMITED_ROLES.includes(user.role);

    if (!isPermitted) {
      return NextResponse.json(
        {
          message: "Vous n'avez pas les droits pour effectuer cette action",
          error: true,
          data: null,
        },
        { status: 403 }
      );
    }

    const revalidated = await addProductByAdminSchema.parse(body);

    const name = normalizeProductName(revalidated.name.trim());
    const slug = generateSlug(revalidated.name);

    const uidCat = revalidated.category.slice(0, 3).toUpperCase();
    const uidTyp = revalidated.type
      ? revalidated.type.slice(0, 2).toUpperCase()
      : "OT";

    const uid = uidCat + uidTyp + generateDigitNumber(6);

    // Vérifier si le produit existe déjà

    const newProduct = await prisma.product.create({
      data: {
        name: name.toLowerCase(),
        price: revalidated.price,
        stock: revalidated.stock,
        description: revalidated.description,
        category: revalidated.category,
        state: revalidated.state,
        quality: revalidated.quality,
        type: revalidated.type,
        material: revalidated.material,
        brand: revalidated.brand,
        target: revalidated.target,
        image: revalidated.image,
        images: revalidated.images,
        slug: slug,
        uid,
      },
    });

    const getSubShops = await prisma.shop.findMany({
      where: { ajout: "auto" },
    });

    if (getSubShops.length > 0) {
      for (const shop of getSubShops) {
        if (revalidated.category === shop.category) {
          await prisma.productShop.create({
            data: {
              productId: newProduct.id,
              shopId: shop.id,
              percentage: shop.percentage ?? 5,
              price: calculateTotalPrice(
                revalidated.price,
                shop.percentage ?? 5
              ),
            },
          });
        }
      }
    }

    const product = await prisma.product.findFirst({
      where: { uid },
    });

    return NextResponse.json({
      message: "Produit créé avec succès",
      error: false,
      data: product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Gère les erreurs de validation Zod
      const formattedErrors = error.issues.map((err) => ({
        path: err.path.join(" > "), // Chemin de l'erreur dans l'objet de données
        message: err.message, // Message d'erreur
      }));

      console.log({ formattedErrors });

      // Retourner les erreurs de validation Zod
      return NextResponse.json(
        {
          error: true,
          message: "Erreur de validation des données",
          details: formattedErrors,
          data: null,
        },
        { status: 400 }
      );
    }

    const err = error as Error;
    return NextResponse.json(
      {
        error: true,
        message: err.message,
        data: null,
      },
      { status: 500 }
    );
  }
}
