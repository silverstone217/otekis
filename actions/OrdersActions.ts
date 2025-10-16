"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";
import { returnDataValue } from "@/utils/functions";
import { ColorsData, PERMITED_ROLES } from "@/utils/dataAdd";
import { AllProductsTypes } from "@/utils/data";
import { pusher } from "@/lib/pusher-server";
import { getCompanyPreference } from "./companyAction";

export const getAllOrdersByStatus = async (status: string) => {
  const user = await getUser();
  if (!user) return [];

  const isPermitted = user ? PERMITED_ROLES.includes(user.role) : false;
  if (!isPermitted) return [];

  const orders = await prisma.order.findMany({
    where: {
      status,
    },
    include: {
      orderItems: true,
      user: {
        omit: {
          password: true,
        },
      },
      shop: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const filteredOrders = orders.map((order) => {
    const { shop, user, ...rest } = order;
    const quantity = order.orderItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    return {
      ...rest,
      shopName: order.shop.name,
      shopId: order.shop.id,
      userId: order.user.id,
      userName: order.user.name,
      userEmail: order.user.email,
      quantity,
    };
  });

  return filteredOrders ?? [];
};

// GET ORDER BY ID ADMIN!
export const getOrderById = async (id: string) => {
  const user = await getUser();
  if (!user) return null;

  const isPermitted = user ? PERMITED_ROLES.includes(user.role) : false;
  if (!isPermitted) return null;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
      deliveryOrder: true,
      user: {
        omit: {
          password: true,
        },
      },
      shop: true,
    },
  });

  if (!order) return null;

  // Utilisation de Promise.all pour gérer les appels asynchrones dans map
  const orderItems = await Promise.all(
    order.orderItems.map(async (item) => {
      const article = await prisma.article.findUnique({
        where: { id: item.articleId },
        include: { Product: true },
      });

      if (!article || !article.Product) return null;

      return {
        ...item,
        productName: article.Product.name,
        productType: article.Product.type,
        productPrice: article.Product.price,
        productImage: article.Product.image,
        productCategory: article.Product.category,
        productUID: article.Product.uid,
        productStock: article.stock,
        articleInfo: `
        ${
          article.Product.type
            ? returnDataValue(article.Product.type, AllProductsTypes)
            : ""
        }
        ${article.color ? returnDataValue(article.color, ColorsData) : ""} ${
          article.size ?? ""
        }`.trim(),
      };
    })
  );

  // Filtrer les éventuels null (articles non trouvés)
  const filteredOrderItems = orderItems.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  return {
    ...order,
    orderItems: filteredOrderItems,
  };
};

// Change status Order =
export async function changeOrderStatus(orderId: string, status: string) {
  try {
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message:
          "Vous devez être connecté pour modifier le status de votre commande",
      };
    }

    const isPermitted = PERMITED_ROLES.includes(user.role);
    if (!isPermitted) {
      return {
        error: true,
        message: "Non autorisé!",
        data: null,
      };
    }

    const idOrderExist = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!idOrderExist) {
      return {
        error: true,
        message: "Cette commande n'existe pas",
      };
    }

    if (idOrderExist.status === status) {
      return {
        error: true,
        message: "Cette commande est déjà à ce status",
      };
    }

    // Mise à jour du status de la commande
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Si le status est "en cours d'annulation", mettre à jour la livraison et supprimer le profit en attente
    if (status === "en cours d'annulation") {
      await prisma.deliveryOrder.updateMany({
        where: { orderId: order.id },
        data: { status },
      });

      // shop benefit
      const shopProfitWaitedExist = await prisma.shopProfitWaited.findUnique({
        where: { orderId: order.id },
      });

      if (shopProfitWaitedExist) {
        await prisma.shopProfitWaited.delete({
          where: { id: shopProfitWaitedExist.id },
        });
      }

      // otekis benefit
      const otekisProfitWaitedExist =
        await prisma.otekisProfitWaited.findUnique({
          where: { orderId: order.id },
        });
      if (otekisProfitWaitedExist) {
        await prisma.otekisProfitWaited.delete({
          where: { id: otekisProfitWaitedExist.id },
        });
      }
    }

    if (!order) {
      return {
        error: true,
        message: "Erreur lors de la modification du status de la commande",
      };
    }

    // Mise à jour du compteur de commandes en cours de traitement
    const count = await prisma.order.count({
      where: { status: "en cours de traitement" },
    });

    await pusher.trigger("orders-channel", "order-count-updated", { count });

    return {
      error: false,
      message: "Le status de votre commande a été modifié avec succès",
      order,
    };
  } catch (error) {
    console.error("Erreur dans changeOrderStatus:", error);
    return {
      error: true,
      message: "Une erreur est survenue lors du changement de status",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

// Change status Order =
export async function changeOrderStatusWithDeliveryAgent(
  orderId: string,
  status: string,
  selectedDeliveryMan: string
) {
  const user = await getUser();
  if (!user) {
    return {
      error: true,
      message:
        "Vous devez être connecté pour modifier le status de votre commande",
    };
  }

  const isPermitted = user ? PERMITED_ROLES.includes(user.role) : false;

  if (!isPermitted) {
    return {
      error: true,
      message: "Non autorisé!",
      data: null,
    };
  }

  const idOrderExist = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!idOrderExist) {
    return {
      error: true,
      message: "Cette commande n'existe pas",
    };
  }
  if (idOrderExist.status === status) {
    return {
      error: true,
      message: "Cette commande est déjà à ce status",
    };
  }

  const findAgent = await prisma.deliveryAgent.findUnique({
    where: {
      id: selectedDeliveryMan,
    },
  });

  if (!findAgent) {
    return {
      error: true,
      message: "Agent de livraison non trouvé",
    };
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
    },
  });

  const updateDelivery = await prisma.deliveryOrder.updateMany({
    where: {
      orderId: orderId,
    },
    data: {
      status,
    },
  });

  // add delivery to this order
  const updateDeliveryOrder = await prisma.deliveryOrder.updateMany({
    where: {
      orderId: orderId,
    },
    data: {
      deliveryId: findAgent.id,
      deliveryDate: new Date(),
    },
  });

  if (!order || !updateDelivery) {
    return {
      error: true,
      message: "Erreur lors de la modification du status de la commande",
    };
  }

  const count = await prisma.order.count({
    where: { status: "en cours de traitement" },
  });
  await pusher.trigger("orders-channel", "order-count-updated", { count });

  return {
    error: false,
    message: "Le status de votre commande a été modifié avec succès",
    order: order,
  };
}

// Change status Order =
export async function changeOrderStatusWithDeliveryCompany(
  orderId: string,
  status: string
) {
  const user = await getUser();
  if (!user) {
    return {
      error: true,
      message:
        "Vous devez être connecté pour modifier le status de votre commande",
    };
  }

  const isPermitted = user ? PERMITED_ROLES.includes(user.role) : false;

  if (!isPermitted) {
    return {
      error: true,
      message: "Non autorisé!",
      data: null,
    };
  }

  const idOrderExist = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!idOrderExist) {
    return {
      error: true,
      message: "Cette commande n'existe pas",
    };
  }
  if (idOrderExist.status === status) {
    return {
      error: true,
      message: "Cette commande est déjà à ce status",
    };
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
    },
  });

  const updateDelivery = await prisma.deliveryOrder.updateMany({
    where: {
      orderId: orderId,
    },
    data: {
      status,
    },
  });

  // add delivery to this order
  const updateDeliveryOrder = await prisma.deliveryOrder.updateMany({
    where: {
      orderId: orderId,
    },
    data: {
      deliveryDate: new Date(),
    },
  });

  if (!order || !updateDelivery) {
    return {
      error: true,
      message: "Erreur lors de la modification du status de la commande",
    };
  }

  const count = await prisma.order.count({
    where: { status: "en cours de traitement" },
  });
  await pusher.trigger("orders-channel", "order-count-updated", { count });

  return {
    error: false,
    message: "Le status de votre commande a été modifié avec succès",
    order: order,
  };
}

// Change refundOrderStatus Order =
export async function refundOrderStatus(
  orderId: string,
  status: string,
  refundRef: string
) {
  const user = await getUser();
  if (!user) {
    return {
      error: true,
      message:
        "Vous devez être connecté pour modifier le status de votre commande",
    };
  }

  const isPermitted = user ? PERMITED_ROLES.includes(user.role) : false;

  if (!isPermitted) {
    return {
      error: true,
      message: "Non autorisé!",
      data: null,
    };
  }

  const prefs = await getCompanyPreference();

  if (!prefs) {
    return {
      error: true,
      message: "Mauvaise configuration. reessayer plus tard!",
      data: null,
    };
  }

  const idOrderExist = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!idOrderExist) {
    return {
      error: true,
      message: "Cette commande n'existe pas",
    };
  }
  if (idOrderExist.status === status) {
    return {
      error: true,
      message: "Cette commande est déjà à ce status",
    };
  }

  if (!idOrderExist.refundPhoneNumber || !idOrderExist.refundReceiverName) {
    return {
      error: true,
      message:
        "Auncune informations sur le destinataire de remboursement trouvées!",
    };
  }

  if (!refundRef) {
    return {
      error: true,
      message: "Vous devez fournir un numéro de référence de remboursement",
    };
  }

  // update order
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      paymentRefRefund: refundRef,
      paymentStatus: "payé",
    },
  });

  // Cancel delivery
  const delivery = await prisma.deliveryOrder.updateMany({
    where: { orderId: order.id },
    data: {
      status: status,
    },
  });

  // create invoice for refund
  const createRefundInvoice = await prisma.facture.create({
    data: {
      orderId: order.id,
      status: "remboursé",
      PaymentRef: refundRef,
      paymentMethod: "mpesa",
      totalAmount: order.totalAmount,
      deliveryPrice: order.deliveryPrice,
      type: "remboursement",
      refundPhoneNumber: order.refundPhoneNumber,
      exchange: prefs.exchangeRate,
      cinetPayPercentage: prefs.cinetPayPercentage,
    },
  });

  if (!order || !createRefundInvoice) {
    return {
      error: true,
      message: "Une erreur est survenue lors de la mise à jour de la commande",
    };
  }

  const count = await prisma.order.count({
    where: { status: "en cours de traitement" },
  });
  await pusher.trigger("orders-channel", "order-count-updated", { count });

  return {
    error: false,
    message: "Le status de votre commande a été modifié avec succès",
    order: order,
  };
}

// Change status Order Payment =
export async function changeOrderStatusPayment(
  orderId: string,
  status: string
) {
  const user = await getUser();
  if (!user) {
    return {
      error: true,
      message:
        "Vous devez être connecté pour modifier le status de paiement de votre commande",
    };
  }

  const isPermitted = user ? PERMITED_ROLES.includes(user.role) : false;

  if (!isPermitted) {
    return {
      error: true,
      message: "Non autorisé!",
      data: null,
    };
  }

  const idOrderExist = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!idOrderExist) {
    return {
      error: true,
      message: "Cette commande n'existe pas",
    };
  }
  if (idOrderExist.status === status) {
    return {
      error: true,
      message: "Cette commande est déjà à ce status de paiement",
    };
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: status,
    },
  });

  if (idOrderExist.paymentRef) {
    const updateDelivery = await prisma.facture.updateMany({
      where: {
        PaymentRef: idOrderExist.paymentRef,
      },
      data: {
        status,
      },
    });
  }

  if (!order) {
    return {
      error: true,
      message:
        "Erreur lors de la modification du status de paiement de la commande",
    };
  }

  const count = await prisma.order.count({
    where: { status: "en cours de traitement" },
  });
  await pusher.trigger("orders-channel", "order-count-updated", { count });

  return {
    error: false,
    message:
      "Le status de paiement de votre commande a été modifié avec succès",
    order: order,
  };
}
