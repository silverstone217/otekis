"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";

type PrintProductsType = {
  selection: "types" | "categories" | "";
  selected: string;
};

export const PrintProductByCatOrTypes = async (filter: PrintProductsType) => {
  const user = await getUser();

  if (!user) {
    return {
      error: true,
      message: "Veuillez vous connecter avant de continuer!",
      data: [],
    };
  }

  const permitRoles = ["admin", "super_admin", "employee"];

  if (!permitRoles.includes(user.role)) {
    return {
      error: true,
      message: "Accès refusé!",
      data: [],
    };
  }

  const { selected, selection } = filter;

  if (!selected && !selection) {
    return {
      error: true,
      message: "Une erreur survenue!",
      data: [],
    };
  }

  const productsByCat = await prisma.product.findMany({
    where: {
      category: selected,
    },
  });

  const productsByTypes = await prisma.product.findMany({
    where: {
      type: selected,
    },
  });

  if (!productsByCat && !productsByTypes) {
    return {
      error: true,
      message: "Une erreur survenue ou Aucun produit trouvé!",
      data: [],
    };
  }

  return {
    error: false,
    message: "Impression en cours",
    data: (selection === "categories" ? productsByCat : productsByTypes) || [],
  };
};
