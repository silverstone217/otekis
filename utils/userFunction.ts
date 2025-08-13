"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "../actions/actions";

type userChangeType = {
  id: string;
  role: string;
};

export const changeUserRole = async ({ id, role }: userChangeType) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas autorisé à faire ça !",
      error: true,
    };
  }

  // Vérifie que l'utilisateur connecté est admin ou super_admin
  if (user.role !== "super_admin" && user.role !== "admin") {
    return {
      message: "Pas assez de permissions !",
      error: true,
    };
  }

  const userExists = await prisma.user.findUnique({ where: { id } });
  if (!userExists) {
    return {
      message: "Utilisateur introuvable !",
      error: true,
    };
  }

  // Si le rôle demandé est identique au rôle actuel
  if (userExists.role === role) {
    return {
      message: "Le rôle est déjà correct !",
      error: false,
    };
  }

  // Empêche un admin (non super_admin) de modifier un super_admin
  if (userExists.role === "super_admin" && user.role !== "super_admin") {
    return {
      message: "Impossible de changer le rôle d'un super admin !",
      error: true,
    };
  }

  // Empêche un admin (non super_admin) de modifier un admin ou super_admin
  if (
    (userExists.role === "admin" || userExists.role === "super_admin") &&
    user.role !== "super_admin"
  ) {
    return {
      message: "Impossible de changer le rôle d'un admin ou super admin !",
      error: true,
    };
  }

  // Empêche de promouvoir quelqu'un en super_admin si on n'est pas super_admin
  if (role === "super_admin" && user.role !== "super_admin") {
    return {
      message: "Impossible de promouvoir un utilisateur en super admin !",
      error: true,
    };
  }

  // Mise à jour du rôle
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
  });

  const { password, ...rest } = updatedUser;
  return {
    message: "Rôle modifié avec succès !",
    error: false,
    data: rest,
  };
};

export const banishUser = async (id: string) => {
  const currentUser = await getUser();
  if (!currentUser) {
    return {
      message: "Pas autorisé à faire ça !",
      error: true,
    };
  }

  const userToBan = await prisma.user.findUnique({ where: { id } });
  if (!userToBan) {
    return {
      message: "Utilisateur introuvable !",
      error: true,
    };
  }

  // Interdiction de bannir soi-même
  if (currentUser.id === userToBan.id) {
    return {
      message: "Vous ne pouvez pas vous bannir ou debannir vous-même !",
      error: true,
    };
  }

  // Règles selon rôle du currentUser
  if (currentUser.role === "super_admin") {
    // Super admin peut bannir tout le monde sauf lui-même (déjà vérifié)
  } else if (currentUser.role === "admin") {
    // Admin ne peut pas bannir admin ou super_admin
    if (userToBan.role === "admin" || userToBan.role === "super_admin") {
      return {
        message:
          "Vous ne pouvez pas bannir ou debannir un admin ou super admin !",
        error: true,
      };
    }
  } else {
    // Autres rôles n'ont pas la permission
    return {
      message: "Pas assez de permissions !",
      error: true,
    };
  }

  // Bascule le statut de bannissement
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isBanned: !userToBan.isBanned },
  });

  const { password, ...rest } = updatedUser;
  return {
    message: userToBan.isBanned
      ? "Utilisateur débanni avec succès !"
      : "Utilisateur banni avec succès !",
    error: false,
    data: rest,
  };
};
