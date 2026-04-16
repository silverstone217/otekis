"use server";
import { prisma } from "@/lib/prisma";
import {
  NewSupplierProductSchema,
  NewSupplierProductType,
} from "@/schema/supplierSchema";
import { getUser } from "./actions";
import {
  generateDigitNumber,
  generateSlug,
  normalizeProductName,
} from "@/utils/functions";

// GET SHOPS DATA
export const getShopData = async () => {
  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true,
      logo: true,
    },
  });
  return shops ?? [];
};

// NEW PRODUCT SUPPLIER
export const createNewProduct = async (data: NewSupplierProductType) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message: "Vous n'êtes pas autorisé à créer un produit, connectez-vous",
        productId: null,
      };
    }

    // VALIDATE DATA
    const validatedData = NewSupplierProductSchema.safeParse(data);
    if (!validatedData.success) {
      const errorMessages = validatedData.error.issues
        .map((issue) => issue.message)
        .join(", ");

      return {
        error: true,
        message: `Données invalides: ${errorMessages}`,
        productId: null,
      };
    }

    const {
      name,
      description,
      brand,
      price,
      category,
      type,
      state,
      target,
      isAvailable,
      permittedSellers,
      articles,
      commune,
      quartier,
      avenue,
      image,
    } = validatedData.data;

    // CREATE PRODUCT IN DATABASE
    const address = `${commune}, ${quartier}, ${avenue}`;

    const rename = normalizeProductName(name.trim());
    const slug = generateSlug(rename);

    const uidCat = category.slice(0, 3).toUpperCase();
    const uidTyp = type ? type.slice(0, 2).toUpperCase() : "OT";

    const uid = uidCat + uidTyp + generateDigitNumber(6);

    // Add product
    const newProduct = await prisma.supplierProduct.create({
      data: {
        uid,
        name: rename,
        slug,
        description,
        brand,
        price: Number(price), // Convertir le prix en nombre
        category,
        type,
        state,
        isValidated: true,
        target,
        isAvailable,
        image: image,
        address,
        supplierId: user.id,
        Article: {
          create: articles.map((article) => ({
            color: article.color,
            size: article.size,
            stock: article.quantity,
          })),
        },
        quality: "original",
        stock: articles.reduce((total, article) => total + article.quantity, 0),
      },
    });

    // ADD permit shops if exist!
    if (isAvailable === "specific_sellers" && permittedSellers.length > 0) {
      await prisma.permittedSeller.createMany({
        data: permittedSellers.map((shopId) => ({
          supplierProductId: newProduct.id,
          shopId,
        })),
      });
    }

    return {
      error: false,
      message: "Produit créé avec succès",
      productId: newProduct.id,
    };
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors de la création du produit",
      productId: null,
    };
  }
};

// export const UPDATE PRODUCT IMAGE
export const supplierProductImages = async (data: {
  productId: string;
  image: string;
  images: string[];
}) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier ce produit, connectez-vous",
      };
    }

    // IS PRODUCT EXIST
    const isProductExists = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExists) {
      return {
        error: true,
        message: "Produit introuvable",
      };
    }

    if (isProductExists.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous n'êtes pas autorisé à modifier ce produit",
      };
    }

    await prisma.supplierProduct.update({
      where: { id: isProductExists.id },
      data: { image: data.image },
    });

    return {
      error: false,
      message: "Image ajoutee avec success",
    };
  } catch (error) {
    console.error("Upadte image product", error);
    return {
      error: true,
      message: "Erreur survenue sur l'ajout de l'image produit",
    };
  }
};
