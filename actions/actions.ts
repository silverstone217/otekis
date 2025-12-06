"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleUserType } from "@/types/auth";
import { ColorsData, PERMITED_ROLES } from "@/utils/dataAdd";
import { returnDataValue } from "@/utils/functions";
import { Article } from "@prisma/client";

export const getUser = async () => {
  const session = await auth();

  if (!session?.user?.email) return null;

  return await prisma.user.findUnique({
    where: { email: session.user.email },
    omit: { password: true },
  });
};

// delete products images
export const updateImagesProductImages = async (
  productId: string,
  images: string[]
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return null;
  }

  const modProducts = await prisma.product.update({
    where: { id: productId },
    data: {
      images: images,
    },
  });
  return modProducts;
};

// change Admin role
export const changeAdminRole = async (
  userId: string,
  newRole: roleUserType
) => {
  const getCurrentUser = await getUser();
  if (!getCurrentUser || getCurrentUser.role !== "super_admin") {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const modUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
    },
  });
  const { password, ...rest } = modUser;

  return rest;
};

// create ProductName for history order
function buildProductName(
  productName: string,
  size?: string,
  color?: string
): string {
  return `${productName} ${size ? size : ""} ${
    color ? returnDataValue(color, ColorsData) : ""
  }`;
}

// CREATE NEW ARTICLE AND HISTORY ORDER
export const addItemForProduct = async (
  productId: string,
  item: {
    color: string;
    size: string;
    stock: number;
    commandNumber: string;
    flavor?: string;
    volume?: string;
  }
) => {
  try {
    const user = await getUser();
    if (!user || !PERMITED_ROLES.includes(user.role)) {
      return { error: true, message: "Non autorisé!", data: null };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { Article: true },
    });
    if (!product) {
      return { error: true, message: "Produit introuvable.", data: null };
    }

    const { color, size, stock, commandNumber } = item;
    const { Article: articles } = product;

    // doublon exact avec meme couleur taille et numero de commande
    const isSameArticleExist = articles.find(
      (a) =>
        a.color === color &&
        a.size === size &&
        a.commandNumber === commandNumber
    );
    if (isSameArticleExist) {
      return {
        error: true,
        message:
          "Article déjà existant, veuillez modifier ou changer le numéro de commande.",
        data: null,
      };
    }

    // article avec même color + size ? update stock + create history
    const existingArticle = articles.find(
      (a) => a.color === color && a.size === size
    );

    if (existingArticle) {
      const productName = buildProductName(
        product.name,
        existingArticle.size!,
        existingArticle.color!
      );
      await prisma.historyOrder.create({
        data: {
          productName,
          articleId: existingArticle.id,
          stock,
          commandNumber,
          productId,
        },
      });
      const updatedArticle = await prisma.article.update({
        where: { id: existingArticle.id },
        data: { stock: existingArticle.stock + stock },
      });
      return {
        error: false,
        message: "Article ajouté avec succès",
        data: updatedArticle,
      };
    }

    // création nouvel article + historique
    const newArticle = await prisma.article.create({
      data: {
        color,
        size,
        stock,
        productId,
        commandNumber,
        flavor: item.flavor,
        volume: item.volume,
      },
    });
    const productName = buildProductName(
      product.name,
      newArticle.size!,
      newArticle.color!
    );

    const newHistoryOrder = await prisma.historyOrder.create({
      data: {
        productName,
        articleId: newArticle.id,
        stock,
        commandNumber,
        productId,
      },
    });

    return {
      error: false,
      message: "Article ajouté avec succès",
      data: newHistoryOrder,
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: "Erreur lors de l'ajout de l'article",
      data: null,
    };
  }
};

// delete article with his H.Order
export const DeleteItemForProductWithHistoricOrder = async (
  productId: string,
  item: {
    color: string;
    size: string;
    stock: number;
    id: string;
    commandNumber: string;
  }
) => {
  try {
    const user = await getUser();
    if (!user || !PERMITED_ROLES.includes(user.role)) {
      return { error: true, message: "Non autorisé!", data: null };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { Article: true },
    });

    if (!product) {
      return {
        error: true,
        message: "Produit introuvable ou supprimé",
        data: null,
      };
    }

    const { color, size, commandNumber, id } = item;
    const articles = product.Article;
    const currentArticle = articles.find((a) => a.id === id);

    if (!currentArticle) {
      return {
        error: true,
        message: "Article non trouvé, vérifier les informations",
        data: null,
      };
    }

    const productName = buildProductName(product.name, size, color);

    // Recherche sur clés métier
    const historyOrder = await prisma.historyOrder.findFirst({
      where: {
        productId: product.id,
        commandNumber,
        articleId: currentArticle.id,
        productName,
      },
    });

    if (!historyOrder) {
      return {
        error: true,
        message: "Aucun historique de commande correspondant pour cet article.",
        data: null,
      };
    }

    // Vérifie que l'opération ne met pas le stock négatif
    if (currentArticle.stock < historyOrder.stock) {
      return {
        error: true,
        message: "Stock de l'article insuffisant pour cette suppression.",
        data: null,
      };
    }

    // ATOMICITÉ : transaction pour ne rien casser si échec
    const [deleted, updatedArticle] = await prisma.$transaction([
      prisma.historyOrder.delete({ where: { id: historyOrder.id } }),
      prisma.article.update({
        where: { id: currentArticle.id },
        data: {
          stock: { decrement: historyOrder.stock },
        },
      }),
    ]);

    return {
      error: false,
      message: "Historique supprimé et stock mis à jour avec succès.",
      data: updatedArticle,
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message:
        "Erreur lors de la suppression de l'historique ou de la mise à jour de l'article",
      data: null,
    };
  }
};

// delete article
export const deleteItemForProduct = async (
  productId: string,
  itemId: string
) => {
  const getCurrentUser = await getUser();
  const isPermitted = getCurrentUser
    ? PERMITED_ROLES.includes(getCurrentUser.role)
    : false;

  if (!isPermitted) {
    return {
      error: true,
      message: "Non autorisé!",
      data: null,
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { Article: true },
  });

  if (!product) {
    return {
      error: true,
      message: "Cet produit n'est pas disponible ou a été supprimé",
      data: null,
    };
  }
  const Article = await prisma.article.findUnique({
    where: { id: itemId },
    include: { Product: true },
  });
  if (!Article) {
    return {
      error: true,
      message: "Cet article n'est pas disponible ou a été supprimé",
      data: null,
    };
  }

  await prisma.article.delete({ where: { id: itemId } });

  return {
    data: {
      ...product,
      Article: product.Article.filter((art) => art.id !== itemId),
    },
    error: false,
    message: " Article supprimé avec succès",
  };
};

// Modify stock for Article without Hist Orders (Pertes-loss)
export type ModifyStockArticleWithoutHistOrders = {
  article: Article;
  stock: number;
};
export const modifyStockArticle = async (
  data: ModifyStockArticleWithoutHistOrders
) => {
  const getCurrentUser = await getUser();
  const isPermitted = getCurrentUser
    ? PERMITED_ROLES.includes(getCurrentUser.role)
    : false;

  if (!isPermitted) {
    return {
      error: true,
      message: "Non autorisé!",
      data: null,
    };
  }
  const { article, stock } = data;
  const isArticleExist = await prisma.article.findUnique({
    where: { id: article.id },
  });
  if (!isArticleExist) {
    return {
      error: true,
      message: "Cet article n'est pas disponible ou a été supprimé",
      data: null,
    };
  }
  const updateArticle = await prisma.article.update({
    where: { id: article.id },
    data: {
      stock: stock,
    },
  });
  if (!updateArticle) {
    return {
      error: true,
      message: "Erreur lors de la mise à jour du stock",
      data: null,
    };
  }
  return {
    error: false,
    message: "Stock mis à jour avec succès",
    data: updateArticle,
  };
};
