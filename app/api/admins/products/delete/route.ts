import { prisma } from "@/lib/prisma";
import { deleteProductByAdminSchema } from "@/schema/productSchema";
import { getUser } from "@/actions/actions";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PERMITED_ROLES } from "@/utils/dataAdd";

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

    const isPermitted = PERMITED_ROLES.includes(user.role);

    if (!isPermitted) {
      return NextResponse.json(
        {
          message: "Vous n'avez pas les droits pour effectuer cette action",
          error: true,
        },
        { status: 403 }
      );
    }

    const revalidated = await deleteProductByAdminSchema.parse(body);

    // Vérifier si le produit existe déjà
    const isProductExist = await prisma.product.findUnique({
      where: { id: revalidated.id },
    });

    if (!isProductExist) {
      return NextResponse.json(
        { message: "Produit introuvable", error: true },
        { status: 404 }
      );
    }

    const newProduct = await prisma.product.delete({
      where: { id: revalidated.id },
    });

    const addToDeletedProduct = await prisma.deletedProduct.create({
      data: {
        description: revalidated.description,
        name: isProductExist.name,
      },
    });

    return NextResponse.json({
      message: "Produit supprimé avec succès",
      data: newProduct,
      error: false,
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
        },
        { status: 400 }
      );
    }

    const err = error as Error;

    console.log({ err });

    return NextResponse.json(
      {
        error: true,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
