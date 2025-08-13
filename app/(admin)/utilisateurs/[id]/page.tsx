import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import NoUserComponent from "@/components/NoUserComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { returnRoleWith } from "@/utils/functions";
import { Shop, ProductShop } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import UserDetailPage, {
  ShopWIthProductShopType,
} from "@/components/admins/users/MainUserInfo";

const getUserByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
};

const getAllUserShops = async (userId: string) => {
  const shops = await prisma.shop.findMany({
    where: { userId },
    include: { ProductShop: true, Contact: true, orders: true },
  });
  return shops ?? [];
};

const UserAdminPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;

  if (!id) {
    redirect("/utilisateurs");
  }

  const user = await getUser();

  if (!user) {
    return <NoUserComponent />;
  }

  const role = user.role;
  if (!(role === "admin" || role === "super_admin")) {
    return <NotAuthorizedComponent />;
  }

  const adminUser = await getUserByUserId(id);
  const shops = (await getAllUserShops(
    id
  )) as unknown as ShopWIthProductShopType[];

  if (!adminUser) {
    return (
      <div className="w-full min-h-[70dvh] flex flex-col items-center text-center justify-center text-gray-600">
        <p className="text-2xl font-bold">
          {" "}
          {`Utilisateur introuvable ou n'existe plus!`}
        </p>
        <Link
          href="/utilisateurs"
          className="hover:underline transition-all ease-in-out duration-500 mt-2"
        >
          Retour à la liste des utilisateurs
        </Link>
      </div>
    );
  }

  if (adminUser?.role.includes("admin") && user.role !== "super_admin") {
    return (
      <div className="w-full min-h-[70dvh] flex flex-col items-center text-center justify-center text-gray-600">
        <p className="text-2xl font-bold max-w-3xl mx-auto">
          {" "}
          {`Cet utilisateur est déjà un ${returnRoleWith(
            adminUser.role
          )}! et vous n'avez pas les permissions necessaires`}
        </p>
        <Link
          href="/admins"
          className="hover:underline transition-all ease-in-out duration-500 mt-4"
        >
          Retour à la liste des utilisateurs
        </Link>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<p>Chargement...</p>}>
        <UserDetailPage user={adminUser} shops={shops} />
      </Suspense>
    </>
  );
};

export default UserAdminPage;
