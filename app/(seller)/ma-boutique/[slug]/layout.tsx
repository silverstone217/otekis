// app/ma-boutique/[slug]/layout.tsx
import { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import NotShopStatusFind from "@/components/shop/NotPublishedComponent";

export default async function ShopLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1️⃣ Vérification utilisateur connecté
  const user = await getUser();
  if (!user) {
    return <NotAuthorizedComponent />;
  }

  // 2️⃣ Récupération du shop via le slug
  const shop = await prisma.shop.findUnique({
    where: { slug, userId: user.id },
  });

  // 3️⃣ Vérifications d’accès
  if (!shop) {
    return <NotShopStatusFind />;
  }

  if (shop.userId !== user.id) {
    return <NotAuthorizedComponent />;
  }

  // 4️⃣ Si tout est bon, on rend la page
  return <>{children}</>;
}
