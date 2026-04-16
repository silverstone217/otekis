import { getUser } from "@/actions/actions";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json([]);
  }

  const products = await prisma.supplierProduct.findMany({
    where: {
      supplierId: user.id,
    },
  });
  return NextResponse.json(products || []);
}
