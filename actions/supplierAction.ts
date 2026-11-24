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
  isEmptyString,
  normalizeProductName,
} from "@/utils/functions";
import { IsAvailableType } from "@/utils/supplier";
import { storage } from "@/lib/firebase";
import { deleteObject, ref } from "firebase/storage";
import { DEFAULT_SUPPLIER_IMAGE } from "@/utils/envVariables";
import { revalidatePath } from "next/cache";
import { deleteArticleFile } from "@/lib/firebase-files";
import { Prisma, SupplierCurrency } from "@/lib/generated/prisma/client";
import { PERMITED_ROLES } from "@/utils/dataAdd";

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
      contactNumber,
      paymentNumber,
      deliveryPrice,
      isDelivering,
      file,
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
        contactNumber,
        paymentNumber,
        supplierId: user.id,
        Article: {
          create: articles.map((article) => ({
            color: article.color,
            size: article.size,
            stock: article.quantity,
            file: file ? file : null,
          })),
        },
        quality: "original",
        stock: articles.reduce((total, article) => total + article.quantity, 0),
        deliveryPrice,
        isDelivering,
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
      data: { image: data.image, images: data.images },
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

// Modify Principal info
type ProductInfo = {
  name: string;
  description: string;
  price: number;
  brand?: string | null;
  productId: string;
};
export const updatePrincipalInfo = async (data: ProductInfo) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier un produit, connectez-vous",
      };
    }

    // is product exist
    const isProductExist = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExist) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    // Check if the poduct is for current user
    if (isProductExist.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    // fix name and slug
    const name = normalizeProductName(data.name);

    const slug =
      name === isProductExist.name ? isProductExist.slug : generateSlug(name);

    await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.supplierProduct.update({
        where: { id: isProductExist.id },
        data: {
          name,
          slug,
          brand: data.brand,
          description: data.description,
          price: data.price,
        },
      });

      const productShops = await tx.supplierProductShop.findMany({
        where: { productId: updatedProduct.id },
      });

      await Promise.all(
        productShops.map((shop) => {
          const benefit = Math.round(
            (shop.percentage * updatedProduct.price) / 100,
          );

          return tx.supplierProductShop.update({
            where: { id: shop.id },
            data: {
              price: updatedProduct.price + benefit,
            },
          });
        }),
      );
    });

    return {
      error: false,
      message: "Modifie avec success!",
    };
  } catch (error) {
    console.error("Erreur lors de la modification du produit:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors de la modification du produit",
    };
  }
};

// MODIFY CLASSIFICATIONS
type ProductClassification = {
  state: string;
  category: string;
  type?: string | null;
  target?: string | null;
  quality: string;
  productId: string;
};

// UPDATE TARGET< TYPE
export const updateClassificationsInfo = async (
  data: ProductClassification,
) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier un produit, connectez-vous",
      };
    }

    // is product exist
    const isProductExist = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExist) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    // Check if the poduct is for current user
    if (isProductExist.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    const { productId, ...rest } = data;

    await prisma.supplierProduct.update({
      where: { id: isProductExist.id },
      data: {
        ...rest,
      },
    });

    return {
      error: false,
      message: "Modifie avec success!",
    };
  } catch (error) {
    console.error("Erreur lors de la modification du produit:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors de la modification du produit",
    };
  }
};

// ADD NEW ARTICLE
type ProductArticles = {
  article: {
    color: string;
    size: string;
    stock: number;
  };
  productId: string;
};
export const addNewArticle = async (data: ProductArticles) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier un produit, connectez-vous",
      };
    }

    // is product exist
    const isProductExist = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExist) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    // Check if the poduct is for current user
    if (isProductExist.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    if (
      (data.article.color && isEmptyString(data.article.color)) ||
      isEmptyString(data.article.size) ||
      isNaN(data.article.stock)
    ) {
      return {
        error: true,
        message: "Veuillez entrer les informations exactes !",
      };
    }

    await prisma.supplierProduct.update({
      where: { id: isProductExist.id },
      data: {
        Article: {
          create: {
            ...data.article,
          },
        },
      },
    });

    return {
      error: false,
      message: "Ajouté avec success!",
    };
  } catch (error) {
    console.error("Erreur lors de la modification du produit:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors de la modification du produit",
    };
  }
};

// DELETE ARTICLE
export const deleteArticleById = async (data: {
  articleId: string;
  productId: string;
}) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier un produit, connectez-vous",
      };
    }

    // is product exist
    const isProductExist = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExist) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    // Check if the poduct is for current user
    if (isProductExist.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    await prisma.supplierProduct.update({
      where: { id: isProductExist.id },
      data: {
        Article: {
          delete: {
            id: data.articleId,
          },
        },
      },
    });

    return {
      error: false,
      message: "Supprimé avec success!",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors de la suppression de l'article",
    };
  }
};

// MODIFY FILE ARTICLE
export const updateArticleFile = async (data: {
  articleId: string;
  productId: string;
  fileUrl: string | null;
}) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier un produit, connectez-vous",
      };
    }

    // is product exist
    const isProductExist = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExist) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    // Check if the poduct is for current user
    if (isProductExist.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    await prisma.supplierArticle.update({
      where: { id: data.articleId },
      data: {
        file: data.fileUrl,
      },
    });

    return {
      error: false,
      message: "Fichier mis à jour avec succès!",
    };
  } catch (error) {
    console.error("Erreur lors de la modification du fichier:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors de la modification du fichier",
    };
  }
};

// DELETE FILE ARTICLE
export const deleteSupplierArticleFile = async (data: {
  articleId: string;
  productId: string;
}) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier un produit, connectez-vous",
      };
    }

    // is product exist
    const isProductExist = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExist) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    // Check if the poduct is for current user
    if (isProductExist.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    await prisma.supplierArticle.update({
      where: { id: data.articleId },
      data: {
        file: null,
      },
    });

    return {
      error: false,
      message: "Fichier supprimé avec succès!",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors de la suppression du fichier",
    };
  }
};

// UPDATE PRODUCT ADDRESS
export const upadteAddressProduct = async (data: {
  address: string;
  productId: string;
  contactNumber: string;
  paymentNumber: string;
  deliveryPrice: number;
  isDelivering: boolean;
}) => {
  try {
    // CHECK USER AUTHENTICATION
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier un produit, connectez-vous",
      };
    }

    // is product exist
    const isProductExist = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!isProductExist) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    // Check if the poduct is for current user
    if (isProductExist.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    await prisma.supplierProduct.update({
      where: { id: isProductExist.id },
      data: {
        address: data.address.trim(),
        contactNumber: data.contactNumber,
        paymentNumber: data.paymentNumber,
        deliveryPrice: data.deliveryPrice,
        isDelivering: data.isDelivering,
      },
    });

    return {
      error: false,
      message: "modifiee avec success!",
    };
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la modification de l'adresse:",
      error,
    );
    return {
      error: true,
      message: "Une erreur est survenue lors de la modification de l'adresse",
    };
  }
};

// AVA/ DISPO
// UPDATE PRODUCT DISPONIBILITY
export const updateDisponibility = async (data: {
  productId: string;
  isAvailable: IsAvailableType;
  permittedSellers: string[];
}) => {
  try {
    // 🔐 AUTH
    const user = await getUser();
    if (!user || user.isBanned) {
      return {
        error: true,
        message:
          "Vous n'êtes pas autorisé à modifier ce produit, connectez-vous",
      };
    }

    // 🔍 CHECK PRODUCT
    const product = await prisma.supplierProduct.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return {
        error: true,
        message: "Ce produit est introuvable",
      };
    }

    if (product.supplierId !== user.id) {
      return {
        error: true,
        message: "Vous ne pouvez pas modifier ce produit!",
      };
    }

    // 🔄 UPDATE TRANSACTION (IMPORTANT)
    await prisma.$transaction(async (tx) => {
      // 1️⃣ UPDATE AVAILABILITY
      await tx.supplierProduct.update({
        where: { id: data.productId },
        data: {
          isAvailable: data.isAvailable,
        },
      });

      // 2️⃣ CLEAN OLD RELATIONS
      await tx.permittedSeller.deleteMany({
        where: { supplierProductId: data.productId },
      });

      // 3️⃣ ADD NEW (SI SPECIFIC)
      if (data.isAvailable === "specific_sellers") {
        if (data.permittedSellers.length === 0) {
          throw new Error("Ajoutez au moins une boutique");
        }

        await tx.permittedSeller.createMany({
          data: data.permittedSellers.map((shopId) => ({
            supplierProductId: data.productId,
            shopId,
          })),
          skipDuplicates: true, // 🔥 sécurité
        });
      }
    });

    return {
      error: false,
      message: "Disponibilité mise à jour avec succès",
    };
  } catch (error: any) {
    console.error("Erreur lors de la modification de la disponibilité:", error);

    return {
      error: true,
      message:
        error.message ||
        "Une erreur est survenue lors de la modification de la disponibilité",
    };
  }
};

// DELETE PRODUCT ____
export const deleteProductById = async ({
  productId,
}: {
  productId: string;
}) => {
  // auth check
  const user = await getUser();
  if (!user || user.isBanned) {
    return {
      error: true,
      message: "Vous n'êtes pas autorisé à modifier ce produit, connectez-vous",
    };
  }

  // 🔍 CHECK PRODUCT
  const product = await prisma.supplierProduct.findUnique({
    where: { id: productId },
    select: {
      id: true,
      supplierId: true,
      image: true,
      images: true,
      Article: true,
      supplierProductShops: {
        select: {
          supplierOrders: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return {
      error: true,
      message: "Ce produit est introuvable",
    };
  }

  if (product.supplierId !== user.id) {
    return {
      error: true,
      message: "Vous ne pouvez pas modifier ce produit!",
    };
  }

  // Check if product has any orders in progress
  const hasOrdersInProgress = product.supplierProductShops.some((shop) =>
    shop.supplierOrders.some((order) => order.id),
  );

  if (hasOrdersInProgress) {
    return {
      error: true,
      message:
        "Impossible de supprimer ce produit car il a des commandes en cours.",
    };
  }

  await prisma.supplierProduct.delete({
    where: { id: productId },
  });

  // =========================
  // 1. DELETE FIREBASE IMAGES
  // =========================
  const deleteImage = async (url: string) => {
    try {
      if (!url) return;

      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (err) {
      console.warn("Erreur suppression image:", err);
    }
  };

  // image principale
  if (DEFAULT_SUPPLIER_IMAGE !== product.image) {
    await deleteImage(product.image);
  }

  // images secondaires
  if (product.images?.length) {
    await Promise.all(product.images.map((img) => deleteImage(img)));
  }

  // Delete articles with files
  if (product.Article?.length) {
    await Promise.all(
      product.Article.filter((a) => a.file).map(
        (a) => a.file && deleteArticleFile(a.file),
      ),
    );
  }

  revalidatePath("/fournisseurs");

  return {
    error: false,
    message: "Produit supprimé",
  };
};

// STATS

// Dans supplierAction.ts

const ITEMS_PER_PAGE = 10;

export type SupplierStatsResult = {
  success: boolean;
  message?: string;
  currency: SupplierCurrency;
  balance: string;
  totalReceived: string;
  totalEarnings: string;
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  transactions: {
    id: string;
    amount: string;
    currency: string;
    exchange: number;
    date: string;
    status: string;
    paymentPhone: string;
    paymentName: string;
    transfertID: string | null;
  }[];
};

export async function getSupplierStats(
  currency: SupplierCurrency = "USD",
  page: number = 1,
): Promise<SupplierStatsResult> {
  const emptyResult: SupplierStatsResult = {
    success: false,
    message: "Impossible de récupérer vos statistiques.",
    currency,
    balance: "0",
    totalReceived: "0",
    totalEarnings: "0",
    totalTransactions: 0,
    currentPage: 1,
    totalPages: 0,
    transactions: [],
  };

  try {
    // 1. Authentification
    const user = await getUser();

    if (!user) {
      return {
        ...emptyResult,
        message: "Accès non autorisé.",
      };
    }

    // 2. Validation des paramètres
    if (currency !== "USD" && currency !== "CDF") {
      return emptyResult;
    }

    const currentPage = Number.isFinite(page)
      ? Math.max(1, Math.floor(page))
      : 1;

    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    // 3. Solde disponible selon la devise
    const balance =
      currency === "USD"
        ? user.supplierBenefitAmount
        : user.supplierBenefitAmountCDF;

    // 4. Total des retraits traités dans la devise sélectionnée
    const totalsWhere = {
      supplierId: user.id,
      currency,
      status: "traité",
    };

    // 5. Historique complet : toutes devises et tous statuts
    const historyWhere = {
      supplierId: user.id,
    };

    const [aggregate, totalTransactions, withdrawals] = await Promise.all([
      prisma.supplierWithdrawalHistory.aggregate({
        where: totalsWhere,
        _sum: {
          amount: true,
        },
      }),

      prisma.supplierWithdrawalHistory.count({
        where: historyWhere,
      }),

      prisma.supplierWithdrawalHistory.findMany({
        where: historyWhere,
        select: {
          id: true,
          amount: true,
          currency: true,
          exchange: true,
          date: true,
          status: true,
          paymentPhone: true,
          paymentName: true,
          transfertID: true,
        },
        orderBy: {
          date: "desc",
        },
        skip,
        take: ITEMS_PER_PAGE,
      }),
    ]);

    // 6. Total déjà reçu dans la devise sélectionnée
    const totalReceived = aggregate._sum.amount ?? new Prisma.Decimal(0);

    // 7. Total des gains = solde disponible + total déjà reçu
    const totalEarnings = new Prisma.Decimal(balance.toString())
      .plus(totalReceived)
      .toString();

    // 8. Retour des données sérialisées
    return {
      success: true,
      currency,
      balance: balance.toString(),
      totalReceived: totalReceived.toString(),
      totalEarnings,
      totalTransactions,
      currentPage,
      totalPages: Math.ceil(totalTransactions / ITEMS_PER_PAGE),

      transactions: withdrawals.map((withdrawal) => ({
        id: withdrawal.id,
        amount: withdrawal.amount.toString(),
        currency: withdrawal.currency,
        exchange: withdrawal.exchange,
        date: withdrawal.date.toISOString(),
        status: withdrawal.status,
        paymentPhone: withdrawal.paymentPhone,
        paymentName: withdrawal.paymentName,
        transfertID: withdrawal.transfertID,
      })),
    };
  } catch (error) {
    console.error("[GET_SUPPLIER_STATS]", error);
    return emptyResult;
  }
}
