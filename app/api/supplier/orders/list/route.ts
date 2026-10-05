import { getUser } from "@/actions/actions";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json([]);
  }

  const orders = await prisma.supplierOrder.findMany({
    where: {
      productShop: {
        Product: {
          supplierId: user.id,
        },
      },
    },
    include: {
      supplierEarning: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return NextResponse.json(orders || []);
}
