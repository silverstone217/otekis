/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import {
  CancelOrderByUserSchema,
  ModifyUserOrderInfoSchema,
} from "@/schema/orderSchema";
import { AllProductsTypes } from "@/utils/data";
import { ColorsData } from "@/utils/dataAdd";
import { returnDataValue } from "@/utils/functions";
import { Order, OrderItem } from "@/lib/generated/prisma/client";
import { z } from "zod";
import { getUser } from "./actions";
import { pusher } from "@/lib/pusher-server";

export type OrderItemWithProduct = OrderItem & {
  productName?: string | null;
  productImage?: string | null;
  productType?: string | null;
  productPrice?: number | null;
  productDescription?: string | null;
  productInfo?: string | null;
  productId?: string | null;
};

export type OrderWithProductDetails = Order & {
  orderItems: OrderItemWithProduct[];
};

// get myOrderbyId
export const getMyOrderById = async (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shopCategory: string,
): Promise<OrderWithProductDetails | null> => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: true },
  });
  if (!order) return null;

  const products = await Promise.all(
    order.orderItems.map(async (item) => {
      const article = await prisma.article.findUnique({
        where: { id: item.articleId },
        include: { Product: true },
      });

      return {
        ...item,
        productId: article?.Product.id,
        productName: article?.Product.name,
        productImage: article?.Product.image,
        productType: article?.Product.type,
        productPrice: article?.Product.price,
        productDescription: article?.Product.description,
        productInfo: `${
          article?.color && returnDataValue(article?.color, ColorsData)
        } ${article?.size} ${
          article?.Product.type &&
          returnDataValue(article?.Product.type, AllProductsTypes)
        }`,
      };
    }),
  );

  return {
    ...order,
    orderItems: products,
  };
};

// get delivery order with client order
export const getDeliveryOrderWithClientOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { deliveryOrder: true },
  });
  if (!order) return null;

  const { deliveryOrder } = order;

  const { deliveryCompanyId } = deliveryOrder!;

  if (!deliveryCompanyId) return null;

  const deliveryCompany = await prisma.deliveryCompany.findUnique({
    where: { id: deliveryCompanyId },
  });
  if (!deliveryCompany) return null;

  const isSelfPickUp = deliveryCompany.name
    .trim()
    .toLocaleLowerCase()
    .includes("self-pick-up");

  if (isSelfPickUp) {
    return {
      delivery: "Self pick-up/ Recuperer soi-meme",
      phone: deliveryOrder?.receiverTel,
      isOtekisDelivery: false,
      validationPossible: true,
      paymentMethod: deliveryCompany.paymentMethod,
    };
  }

  const isOtekisDelivery = deliveryCompany.name
    .trim()
    .toLocaleLowerCase()
    .includes("otekis");

  if (!isOtekisDelivery) {
    return {
      delivery: deliveryCompany.name,
      phone: deliveryCompany.phone,
      isOtekisDelivery,
      validationPossible: deliveryCompany.validationPossible,
      paymentMethod: deliveryCompany.paymentMethod,
    };
  }

  if (!deliveryOrder?.deliveryId) return null;

  const agent = await prisma.deliveryAgent.findUnique({
    where: { id: deliveryOrder.deliveryId },
  });
  if (!agent) return null;

  return {
    delivery: agent.name,
    phone: agent.phone,
    isOtekisDelivery,
    validationPossible: deliveryCompany.validationPossible,
    paymentMethod: deliveryCompany.paymentMethod,
  };
};

// MODIFY USER INFO ORDER
export type ModifyUserInfoOrdertype = z.infer<typeof ModifyUserOrderInfoSchema>;
export const modifyUserInfoOrder = async (data: ModifyUserInfoOrdertype) => {
  // check user
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
      data: null,
    };
  }

  //   validate data
  const validationResult = ModifyUserOrderInfoSchema.safeParse(data);

  if (!validationResult.success) {
    console.log(validationResult.error.issues, "erreurs survenues");
    return {
      error: true,
      message: "Erreur de validation des informations",
      errors: validationResult.error.issues, // Important: Retourner les erreurs Zod
      data: null,
    };
  }

  const validated = validationResult.data;

  // check id order still exists
  const isOrderExist = await prisma.order.findUnique({
    where: {
      id: validated.orderId,
    },
  });

  if (!isOrderExist) {
    return {
      error: true,
      message: "Cette commande n'existe pas",
      data: null,
    };
  }
  // Check if is the owner of the order
  const isUserOwner = isOrderExist.clientId === user.id;
  if (!isUserOwner) {
    return {
      error: true,
      message: "Vous n'êtes pas le propriétaire de cette commande",
      data: null,
    };
  }
  // check status order
  const isOrderStatus = isOrderExist.status === "en cours de traitement";
  if (!isOrderStatus) {
    return {
      error: true,
      message:
        "Cette commande n'est pas en cours de traitement, Impossible de modifier",
      data: null,
    };
  }

  // update the order user info

  const updateOrder = await prisma.order.update({
    where: {
      id: validated.orderId,
    },
    data: {
      receiverAddress: validated.receiverAddress,
      receiverName: validated.receiverName,
      receiverTel: validated.receiverTel,
      description: validated.description,
    },
  });

  // update delivery
  const updateDelivery = await prisma.deliveryOrder.updateMany({
    where: {
      orderId: validated.orderId,
    },
    data: {
      deliveryAddress: validated.receiverAddress,
      receiverName: validated.receiverName,
      receiverTel: validated.receiverTel,
      description: validated.description,
    },
  });

  if (!updateOrder || !updateDelivery) {
    return {
      error: true,
      message: "Erreur lors de la mise à jour de la commande",
      data: null,
    };
  }

  return {
    error: false,
    message: "Commande mise à jour avec succès",
    data: updateOrder,
  };
};

// Cancel order
export type CancelOderType = z.infer<typeof CancelOrderByUserSchema>;
export const cancelOrderByUser = async (data: CancelOderType) => {
  try {
    // Vérifier l'utilisateur connecté
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message: "Pas autorisé à faire ça !",
        data: null,
      };
    }

    // Valider les données avec Zod
    const validationResult = CancelOrderByUserSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Erreurs de validation :", validationResult.error.issues);
      return {
        error: true,
        message: "Erreur de validation des informations",
        errors: validationResult.error.issues, // Retourner les erreurs de validation
        data: null,
      };
    }
    const validated = validationResult.data;

    // Vérifier que la commande existe
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });
    if (!order) {
      return {
        error: true,
        message: "Cette commande n'existe pas",
        data: null,
      };
    }

    // Vérifier que l'utilisateur est propriétaire de la commande
    if (order.clientId !== user.id) {
      return {
        error: true,
        message: "Vous n'êtes pas le propriétaire de cette commande",
        data: null,
      };
    }

    // Vérifier le statut de la commande
    if (order.status !== "en cours de traitement") {
      return {
        error: true,
        message:
          "Cette commande n'est pas en cours de traitement, impossible de modifier",
        data: null,
      };
    }

    // Vérifier si des profits en attente existent pour suppression
    const shopProfitWaitedExist = await prisma.shopProfitWaited.findUnique({
      where: { orderId: validated.orderId },
    });
    const otekisProfitWaitedExist = await prisma.otekisProfitWaited.findUnique({
      where: { orderId: validated.orderId },
    });

    // Préparer les données de mise à jour
    const updateData: any = {
      status: validated.status,
      paymentStatus: "remboursé", //"en cours de remboursement",
      // paymentMethodRefund: validated.paymentMethodRefund,
      // refundReceiverName: validated.refundReceiverName,
      // refundPhoneNumber: validated.refundPhoneNumber,
    };
    if (shopProfitWaitedExist) {
      updateData.shopProfitWaited = { delete: true };
    }
    if (otekisProfitWaitedExist) {
      updateData.otekisProfitWaited = { delete: true };
    }

    // Mettre à jour la commande
    const canceledOrder = await prisma.order.update({
      where: { id: validated.orderId },
      data: updateData,
    });

    // Annuler la livraison associée
    const canceledDelivery = await prisma.deliveryOrder.updateMany({
      where: { orderId: validated.orderId },
      data: { status: "annulé" },
    });

    if (!canceledOrder || canceledDelivery.count === 0) {
      return {
        error: true,
        message: "Impossible d'annuler la commande ou la livraison",
        data: null,
      };
    }

    // Mettre à jour le nombre de commandes en cours et notifier via pusher
    const count = await prisma.order.count({
      where: { status: "en cours de traitement" },
    });
    await pusher.trigger("orders-channel", "order-count-updated", { count });

    // Retourner le succès avec la commande annulée
    return {
      error: false,
      message: "Commande en cours d'annulation",
      data: canceledOrder,
    };
  } catch (error) {
    console.error("Erreur lors de l'annulation de la commande :", error);
    return {
      error: true,
      message: "Erreur serveur lors de l'annulation de la commande",
      data: null,
      errors: error instanceof Error ? error.message : String(error),
    };
  }
};

// Update cancel order
export const updateCancelOrderByUser = async (data: CancelOderType) => {
  try {
    // Vérifier l'utilisateur connecté
    const user = await getUser();
    if (!user) {
      return {
        error: true,
        message: "Pas autorisé à faire ça !",
        data: null,
      };
    }

    // Valider les données avec Zod
    const validationResult = CancelOrderByUserSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Erreurs de validation :", validationResult.error.issues);
      return {
        error: true,
        message: "Erreur de validation des informations",
        errors: validationResult.error.issues,
        data: null,
      };
    }
    const validated = validationResult.data;

    // Vérifier que la commande existe
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });
    if (!order) {
      return {
        error: true,
        message: "Cette commande n'existe pas",
        data: null,
      };
    }

    // Vérifier que l'utilisateur est propriétaire de la commande
    if (order.clientId !== user.id) {
      return {
        error: true,
        message: "Vous n'êtes pas le propriétaire de cette commande",
        data: null,
      };
    }

    const PERMIT_STATUS = ["en cours de traitement", "en cours d'annulation"];

    // Can order be cancelled ( only in status === "en cours de traitement")
    if (!PERMIT_STATUS.includes(order.status)) {
      return {
        error: true,
        message: "Cette commande ne peut plus etre annulée à cette etape!",
        data: null,
      };
    }

    // Vérifier si des profits en attente existent pour suppression
    const shopProfitWaitedExist = await prisma.shopProfitWaited.findUnique({
      where: { orderId: validated.orderId },
    });
    const otekisProfitWaitedExist = await prisma.otekisProfitWaited.findUnique({
      where: { orderId: validated.orderId },
    });

    // Préparer les données de mise à jour
    const updateData: any = {
      // paymentMethodRefund: validated.paymentMethodRefund,
      // refundReceiverName: validated.refundReceiverName,
      // refundPhoneNumber: validated.refundPhoneNumber,
    };
    if (shopProfitWaitedExist) {
      updateData.shopProfitWaited = { delete: true };
    }
    if (otekisProfitWaitedExist) {
      updateData.otekisProfitWaited = { delete: true };
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: validated.orderId },
      data: updateData,
    });

    return {
      error: false,
      message: "Données soumises avec succès",
      data: updatedOrder,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annulation :", error);
    return {
      error: true,
      message: "Erreur serveur lors de la mise à jour de l'annulation",
      data: null,
      errors: error instanceof Error ? error.message : String(error),
    };
  }
};
