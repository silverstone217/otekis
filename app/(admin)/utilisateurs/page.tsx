import {
  UsersColumns,
  UsersDataTable,
} from "@/components/admins/users/UsersDataTable";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import NoUserComponent from "@/components/NoUserComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import React, { Suspense } from "react";

const getUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: {
        notIn: ["admin", "super_admin", "employee"],
      },
    },
    omit: {
      password: true,
    },
  });
  return users;
};

const UsersPage = async () => {
  const user = await getUser();

  if (!user) {
    return <NoUserComponent />;
  }

  const role = user.role;
  if (!(role === "admin" || role === "super_admin")) {
    return <NotAuthorizedComponent />;
  }

  const users = await getUsers();

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out">
      <div
        className="w-full flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between 
  transition-all duration-500 ease-in-out"
      >
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl">
            La section des utilisateurs
          </h2>
          <p className="text-gray-600 lg:text-[17px]">
            Pour voir, modifier ou bannir un utilisateurs ici.
          </p>
        </div>
        {/* navigate */}
        {/* <Link
          href={"/produits/nouveau-produit"}
          className="w-full lg:w-fit lg:px-4 py-3 bg-primary text-center text-white font-medium border-2 border-primary 
    hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out shadow-md
    flex items-center justify-center gap-4
    "
        >
          <Plus className="w-8 flex-shrink-0" />
          <span>Ajouter un nouvel admin</span>
        </Link> */}
      </div>

      {/* Admins */}
      <Suspense fallback={<p>chargement....</p>}>
        <UsersDataTable data={users} columns={UsersColumns} />
      </Suspense>
    </div>
  );
};

export default UsersPage;
