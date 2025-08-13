"use server";
import { AdminsPermitData } from "@/utils/dataAdd";
import { getUser } from "./actions";
import { prisma } from "@/lib/prisma";

// AUTHORIZE ACTION
export const isAuthorizedToContinue = async ({
  permissions,
  permit,
}: {
  permissions: string[];
  permit: string;
}) => {
  for (const permission of permissions) {
    if (permission.includes(permit)) {
      return true;
    }
  }
  return false;
};

// GET HISTORY ORDERS DATA
export const getAllHistoryOrders = async () => {
  const user = await getUser();

  if (!user) {
    return {
      error: true,
      data: [],
      message: "Non connecté pour acceder à ces informations",
    };
  }

  const isPermit = isAuthorizedToContinue({
    permissions: AdminsPermitData,
    permit: user.role,
  });

  if (!isPermit) {
    return {
      error: true,
      data: [],
      message: "Accès refusé!",
    };
  }

  const getAllHisOrders = await prisma.historyOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const allHisOrdersWithArticles = getAllHisOrders
    ? getAllHisOrders.map((his) => ({
        id: his.articleId ? his.articleId : "Supprimé recemment",
        orderId: his.id,
        productId: his.productId,
        name: his.productName,
        stock: his.stock,
        createdAt: his.createdAt,
        orderNumber: his.commandNumber,
      }))
    : [];

  return {
    data: allHisOrdersWithArticles ?? [],
    error: false,
    message: "Données recupeérées",
  };
};
