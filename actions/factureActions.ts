"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";
import { Facture, ProductFacture } from "@prisma/client";

export type FactureOrderWithProductsDetailsType = Facture & {
  productFactures: ProductFacture[];
};

export const getFactureOrderById = async (orderId: string) => {
  try {
    const user = await getUser();
    if (!user) return null;

    const facture = await prisma.facture.findFirst({
      where: {
        orderId,
      },
      include: {
        productFactures: true,
      },
    });

    return facture ?? null;
  } catch (error) {
    console.log(error);
    return null;
  }
};
