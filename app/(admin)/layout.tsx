export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import AsideNavigationBigScreen from "@/components/admins/AsideNavigationBigScreen";
import HeaderSmallScreen from "@/components/admins/HeaderSmallScreen";
import NoUserComponent from "@/components/NoUserComponent";
import { getUser } from "@/actions/actions";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
// import { getUser } from "@/utils/actions";
import React, { ReactNode } from "react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const PERMITED_ROLES = ["admin", "super_admin", "employee"];

const getCount = async (status: string) => {
  const count = await prisma.order.count({
    where: { status },
  });
  return count; // return the count
};

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getUser();
  const isPermitted = user ? PERMITED_ROLES.includes(user?.role) : false;
  // if (!user) {
  //   return <NoUserComponent />;
  // }

  const initialCount = (await getCount("en cours de traitement")) ?? 0;

  // console.log({ initialCount });

  return (
    <div
      className="flex lg:flex-row flex-col lg:h-dvh lg:overflow-hidden
    transition-all duration-500 ease-in-out  w-full
    "
    >
      {/* header small screen */}
      <HeaderSmallScreen initialCount={initialCount} />
      {/* aside big screen */}
      <aside
        className="col-span-1 hidden lg:flex border-r shadow z-30 h-[100dvh]
        overflow-hidden no-scrollbar w-[250px] 2xl:w-[300px] 
        "
      >
        <AsideNavigationBigScreen initialCount={initialCount} />
      </aside>
      <main className="lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden w-full pt-20 pb-4 lg:pt-4 px-4 ">
        {!user ? (
          <NoUserComponent />
        ) : isPermitted ? (
          <div className="mx-auto max-w-7xl">{children}</div>
        ) : (
          <NotAuthorizedComponent />
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
