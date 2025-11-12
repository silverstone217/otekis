"use server";

import { PERMITED_ROLES } from "@/utils/dataAdd";
import { getUser } from "./actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  AddAgentSchema,
  ModifyAgentSchema,
  ModifyCompanySchema,
} from "@/schema/deliverySchema";

export const getAllDeliveriesComp = async () => {
  const user = await getUser();
  if (!user || !PERMITED_ROLES.includes(user.role)) return [];

  const companies = await prisma.deliveryCompany.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });
  return companies.map((c) => ({
    ...c,
    address: c.address ?? "N/A",
    email: c.email ?? "N/A",
  }));
};

// ADD NEW Company
export type newCompanyType = z.infer<typeof AddAgentSchema> & {
  paymentMethod: "mobile_money" | "cash";
};
export const addNewCompany = async (data: newCompanyType) => {
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

  // check if Company with same name exist
  const isCompanyExists = await prisma.deliveryCompany.findFirst({
    where: {
      name: validated.name,
    },
  });

  if (isCompanyExists) {
    return {
      error: true,
      message: "Une companie avec ce nom existe déjà",
      data: null,
    };
  }
  // create new Company
  const newCompany = await prisma.deliveryCompany.create({
    data: {
      name: validated.name,
      email: validated.email ?? undefined,
      phone: validated.phone,
      address: validated.address ?? undefined,
      paymentMethod: data.paymentMethod,
    },
  });

  if (!newCompany) {
    return {
      error: true,
      message: "Erreur lors de la création de la companie",
      data: null,
    };
  }
  return {
    error: false,
    message: "Companie ajoutée avec succès",
    data: newCompany,
  };
};

// UPDATE Company
export type modifyCompanyType = z.infer<typeof ModifyCompanySchema> & {
  paymentMethod: "mobile_money" | "cash";
};
export const modifyACompanyByID = async (data: modifyCompanyType) => {
  const user = await getUser();
  if (!user || !PERMITED_ROLES.includes(user.role)) {
    return {
      error: true,
      message: "Vous n'avez pas les droits pour effectuer cette action",
      data: null,
    };
  }

  //   validate data
  const validationResult = ModifyCompanySchema.safeParse(data);

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

  // check if Company exist
  const isCompanyExists = await prisma.deliveryCompany.findFirst({
    where: {
      id: validated.id,
    },
  });

  if (!isCompanyExists) {
    return {
      error: true,
      message: "Aucune companyie trouvée avec l'ID fourni",
      data: null,
    };
  }
  // create new Company
  const updateCompany = await prisma.deliveryCompany.update({
    where: {
      id: validated.id,
    },
    data: {
      name: validated.name,
      email: validated.email ?? undefined,
      phone: validated.phone,
      address: validated.address ?? undefined,
      isAvailable: validated.isAvailable,
      paymentMethod: data.paymentMethod,
    },
  });

  if (!updateCompany) {
    return {
      error: true,
      message: "Erreur lors de la modification de la companie",
      data: null,
    };
  }
  return {
    error: false,
    message: "Companie modifiée avec succès",
    data: updateCompany,
  };
};

// DELETE BY ID
export const deleteCompanyById = async (id: string) => {
  try {
    const user = await getUser();
    if (!user || !PERMITED_ROLES.includes(user.role)) {
      return {
        error: true,
        message: "Vous n'avez pas les droits pour effectuer cette action",
      };
    }
    const isCompanyExists = await prisma.deliveryCompany.findUnique({
      where: {
        id,
      },
    });
    if (!isCompanyExists) {
      return {
        error: true,
        message: "Aucune companie trouvée avec l'ID fourni",
      };
    }
    const deleteCompany = await prisma.deliveryCompany.delete({
      where: {
        id,
      },
    });
    return {
      error: false,
      message: "companie supprimée avec succès",
    };
  } catch (error) {
    console.error(error);
    return {
      error: true,
      message: "Erreur lors de la suppression de la companie",
    };
  }
};
