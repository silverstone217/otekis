"use server";

import { PERMITED_ROLES } from "@/utils/dataAdd";
import { getUser } from "./actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AddAgentSchema, ModifyAgentSchema } from "@/schema/deliverySchema";

// Définition du type de retour
export type DeliveryManStats = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  livré: number;
  enCours: number;
  createdAt: Date;
};

// get all deliveryMen
export const getDeliveryMen = async (): Promise<DeliveryManStats[]> => {
  try {
    const user = await getUser();
    if (!user || !PERMITED_ROLES.includes(user.role)) return [];

    // Récupération optimisée des données
    const deliverymen = await prisma.deliveryAgent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        // Comptage direct en base de données
        _count: {
          select: {
            deliveryOrder: {
              where: { status: "livré" },
            },
          },
        },
        deliveryOrder: {
          where: { status: "en cours de livraison" },
          select: { id: true }, // Seul l'ID est nécessaire pour le comptage
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transformation simple sans calculs lourds
    return deliverymen.map((deli) => ({
      id: deli.id,
      name: deli.name,
      email: deli.email,
      phone: deli.phone ?? "N/A",
      address: deli.address ?? "N/A",
      livré: deli._count.deliveryOrder,
      enCours: deli.deliveryOrder.length, // .length est O(1)
      createdAt: deli.createdAt,
    }));
  } catch (error) {
    console.error("Erreur dans getDeliveryMen:", error);
    return [];
  }
};

// GET AGENT BY ID
export const getDeliveryManById = async (id: string) => {
  const user = await getUser();
  if (!user || !PERMITED_ROLES.includes(user.role)) return null;

  const agent = await prisma.deliveryAgent.findUnique({
    where: { id },
    include: {
      deliveryOrder: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return agent ?? null;
};

// ADD NEW AGENT
export type newAgentType = z.infer<typeof AddAgentSchema>;
export const addNewAgent = async (data: newAgentType) => {
  const user = await getUser();
  if (!user || !PERMITED_ROLES.includes(user.role)) {
    return {
      error: true,
      message: "Vous n'avez pas les droits pour effectuer cette action",
      data: null,
    };
  }

  //   validate data
  const validationResult = AddAgentSchema.safeParse(data);

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

  // check if agent with same name exist
  const isAgentExists = await prisma.deliveryAgent.findFirst({
    where: {
      name: validated.name,
    },
  });

  if (isAgentExists) {
    return {
      error: true,
      message: "Un agent avec ce nom existe déjà",
      data: null,
    };
  }
  // create new agent
  const newAgent = await prisma.deliveryAgent.create({
    data: {
      name: validated.name,
      email: validated.email ?? undefined,
      phone: validated.phone,
      address: validated.address,
    },
  });

  if (!newAgent) {
    return {
      error: true,
      message: "Erreur lors de la création de l'agent",
      data: null,
    };
  }
  return {
    error: false,
    message: "Agent créé avec succès",
    data: newAgent,
  };
};

// UPDATE AGENT
export type modifyAgentType = z.infer<typeof ModifyAgentSchema>;
export const modifyAgentByID = async (data: modifyAgentType) => {
  const user = await getUser();
  if (!user || !PERMITED_ROLES.includes(user.role)) {
    return {
      error: true,
      message: "Vous n'avez pas les droits pour effectuer cette action",
      data: null,
    };
  }

  //   validate data
  const validationResult = ModifyAgentSchema.safeParse(data);

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

  // check if agent exist
  const isAgentExists = await prisma.deliveryAgent.findFirst({
    where: {
      id: validated.id,
    },
  });

  if (!isAgentExists) {
    return {
      error: true,
      message: "Aucun agent trouvé avec l'ID fourni",
      data: null,
    };
  }
  // create new agent
  const updateAgent = await prisma.deliveryAgent.update({
    where: {
      id: validated.id,
    },
    data: {
      name: validated.name,
      email: validated.email ?? undefined,
      phone: validated.phone,
      address: validated.address,
    },
  });

  if (!updateAgent) {
    return {
      error: true,
      message: "Erreur lors de la modification de l'agent",
      data: null,
    };
  }
  return {
    error: false,
    message: "Agent créé avec succès",
    data: updateAgent,
  };
};

// DELETE BY ID
export const deleteAgentById = async (id: string) => {
  try {
    const user = await getUser();
    if (!user || !PERMITED_ROLES.includes(user.role)) {
      return {
        error: true,
        message: "Vous n'avez pas les droits pour effectuer cette action",
        data: null,
      };
    }
    const isAgentExists = await prisma.deliveryAgent.findUnique({
      where: {
        id,
      },
    });
    if (!isAgentExists) {
      return {
        error: true,
        message: "Aucun agent trouvé avec l'ID fourni",
      };
    }
    const deleteAgent = await prisma.deliveryAgent.delete({
      where: {
        id,
      },
    });
    return {
      error: false,
      message: "Agent supprimé avec succès",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: "Erreur lors de la suppression de l'agent",
    };
  }
};
