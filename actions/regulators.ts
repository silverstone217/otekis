"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";

export const cleanInvalidOrders = async () => {
  try {
    const user = await getUser();
    if (!user || user.role.includes("admin") === false) {
      return {
        error: true,
        message: "Unauthorized",
      };
    }

    // 1. récupérer toutes les commandes avec leurs items
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
    });

    // 2. trouver les commandes invalides
    const invalidOrders: string[] = [];

    for (const order of orders) {
      // aucun item
      if (!order.orderItems || order.orderItems.length === 0) {
        invalidOrders.push(order.id);
        continue;
      }

      // tous les articles supprimés / inexistants
      const articles = await prisma.article.findMany({
        where: {
          id: {
            in: order.orderItems.map((item) => item.articleId),
          },
        },
        select: {
          id: true,
        },
      });

      // aucun article valide trouvé
      if (articles.length === 0) {
        invalidOrders.push(order.id);
      }
    }

    // 3. supprimer les commandes invalides
    if (invalidOrders.length > 0) {
      await prisma.order.deleteMany({
        where: {
          id: {
            in: invalidOrders,
          },
        },
      });
    }

    console.log(
      `CLEAN INVALID ORDERS: ${invalidOrders.length} commandes invalides supprimées`,
    );

    return {
      error: false,
      deleted: invalidOrders.length,
      orders: invalidOrders,
      message: `${invalidOrders.length} commandes invalides supprimées`,
    };
  } catch (error) {
    console.error("CLEAN INVALID ORDERS ERROR:", error);

    return {
      error: true,
      message: "Impossible de nettoyer les commandes",
    };
  }
};
