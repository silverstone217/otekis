"use server";

import { prisma } from "@/lib/prisma";
import z from "zod";

const validationOrderSchema = z.object({
  orderId: z.string(),
  secret: z.string(),
});

export type ValidationOrderType = z.infer<typeof validationOrderSchema>;

export const validationOrder = async (data: ValidationOrderType) => {
  try {
    // Valider les données avec Zod
    const validationResult = validationOrderSchema.safeParse(data);
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
    const { orderId, secret } = validated;

    const prefs = await prisma.otekisPreferences.findFirst();
    if (!prefs) {
      return {
        error: true,
        message:
          "Aucune préférence de devise n'a été configurée pour l'instant",
      };
    }

    // Vérifier que la commande existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return {
        error: true,
        message: "Cette commande n'existe pas",
        data: null,
      };
    }

    // Vérifier le code secret de validation
    if (secret !== order.ValidationCode) {
      return {
        error: true,
        message: "Code de validation incorrect",
        data: null,
      };
    }

    // Vérifier que la commande est en cours de livraison
    if (order.status !== "en cours de livraison") {
      return {
        error: true,
        message: "Cette commande n'est pas en cours de livraison",
        data: null,
      };
    }

    // Mettre à jour le statut de la commande en "livré"
    const validatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "livré" },
    });

    // Mettre à jour le statut de la livraison associée
    await prisma.deliveryOrder.updateMany({
      where: { orderId },
      data: { status: "livré" },
    });

    const deliverOrder = await prisma.deliveryOrder.findFirst({
      where: { orderId },
    });

    if (deliverOrder && deliverOrder.deliveryId) {
      const deliveryAgent = await prisma.deliveryAgent.findUnique({
        where: { id: deliverOrder.deliveryId },
      });
      const deliveryAgentName = deliveryAgent?.name;

      const factureOrder = await prisma.facture.findFirst({
        where: { orderId },
      });

      const invoiceDelivery = await prisma.factureDeliverOrder.create({
        data: {
          amount: order.deliveryPrice,
          currency: order.currency,
          receiverAddress: order.receiverAddress,
          receiverName: order.receiverName,
          receiverTel: order.receiverTel,
          percentage: factureOrder ? factureOrder.cinetPayPercentage : "0",
          orderId: order.id,
          deliverBy: deliveryAgentName ?? "N/A",
          factureId: factureOrder ? factureOrder.id : "N/A",
          exchange: prefs.exchangeRate,
        },
      });
    }
    return {
      error: false,
      message: "Commande validée avec succès",
      data: validatedOrder,
    };
  } catch (error) {
    console.error("Erreur lors de la validation de la commande :", error);
    return {
      error: true,
      message: "Erreur serveur lors de la validation de la commande",
      data: null,
      errors: error instanceof Error ? error.message : String(error),
    };
  }
};
