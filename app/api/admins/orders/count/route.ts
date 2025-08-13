import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adapte ce chemin si besoin
import { PERMITED_ROLES } from "@/utils/dataAdd";
import { getUser } from "@/actions/actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized", error: true },
      { status: 401 }
    );
  }

  const isPermitted = PERMITED_ROLES.includes(user.role);

  if (!isPermitted) {
    return NextResponse.json(
      {
        message: "Vous n'avez pas les droits pour effectuer cette action",
        error: true,
      },
      { status: 403 }
    );
  }

  if (!status) {
    return NextResponse.json(
      { error: "Missing status parameter" },
      { status: 400 }
    );
  }

  try {
    const count = await prisma.order.count({
      where: { status },
    });
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du comptage des commandes" },
      { status: 500 }
    );
  }
}
