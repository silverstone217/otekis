import NoUserComponent from "@/components/NoUserComponent";
import AsideNavigationBigScreen from "@/components/seller/AsideNavigationBigScreen";
import HeaderSmallScreen from "@/components/seller/HeaderSmallScreen";
import { getUser } from "@/actions/actions";
import React, { ReactNode } from "react";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import BannedUserSeller from "@/components/BannedUserSeller";
const SellerLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getUser();
  // const isPermitted = user?.role === "seller" || user?.role.includes("admin");
  const isBanned = user?.isBanned;

  // if (!user) {
  //   return <NoUserComponent />;
  // }

  // if (user.isBanned) {
  //   return <BannedUserSeller />;
  // }

  return (
    <div
      className="flex lg:flex-row flex-col lg:h-dvh lg:overflow-hidden
    transition-all duration-500 ease-in-out  w-full
    "
    >
      {/* header small screen */}
      <HeaderSmallScreen />
      {/* aside big screen */}
      <aside
        className="col-span-1 hidden lg:flex border-r shadow z-30 h-[100dvh]
        overflow-hidden no-scrollbar w-[250px] 2xl:w-[300px]
        "
      >
        <AsideNavigationBigScreen />
      </aside>
      <main className="lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden w-full pt-20 pb-4 lg:pt-4 px-4 ">
        {!user ? (
          <NoUserComponent />
        ) : isBanned ? (
          <BannedUserSeller />
        ) : (
          <div className="mx-auto max-w-7xl">{children}</div>
        )}
      </main>
    </div>
  );
};

export default SellerLayout;
