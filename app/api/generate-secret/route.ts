import { getUser } from "@/actions/actions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { orderId } = await request.json();
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }

  if (!orderId) {
    return NextResponse.json({ message: "Order ID requis" }, { status: 400 });
  }

  // Génère un code secret aléatoire simple (exemple)
  const secret = Math.random().toString(36).slice(2, 10).toUpperCase();

  const isOrderExist = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!isOrderExist) {
    return NextResponse.json(
      { message: "Cette commande n'existe pas!" },
      { status: 404 }
    );
  }

  const order = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      ValidationCode: secret,
    },
  });

  console.log({ secret });

  return NextResponse.json({ secret });
}
