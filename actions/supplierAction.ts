"use server";
import { prisma } from "@/lib/prisma";

export const getShopData = async () => {
  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true,
      logo: true,
    },
  });
  return shops ?? [];
};
