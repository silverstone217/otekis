import NoUserComponent from "@/components/NoUserComponent";
import NoShopFind from "@/components/seller/NoShopFind";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import React from "react";
import { ShopDefaultSelect } from "@/components/seller/SelectWIthOptionsDefaultShop";

const getShopsByID = async (userId: string) => {
  const shops = await prisma.shop.findMany({
    where: { userId },
  });
  return shops;
};

const DashboardSellerPage = async () => {
  const user = await getUser();

  if (!user) {
    return <NoUserComponent />;
  }

  if (user.isBanned) {
    return (
      <div
        className="w-full min-h-[70dvh] flex flex-col items-center
       justify-center text-center mx-auto max-w-2xl text-pretty"
      >
        <p className="text-xl font-bold">
          Votre compte a été banni. Vous ne pouvez pas accéder à votre espace de
          vendeur actuellement.
        </p>
        <p className="mt-2 text-gray-600">
          {` Veuillez contacter votre administrateur pour plus d'information.`}
        </p>
        <div className="mt-2 text-gray-600 flex gap-4 flex-wrap item-center justify-start text-sm">
          <p className=" text-gray-600 px-3 py-1 border-gray-400 bg-black/10 rounded-xl">
            oteki@gmail.com
          </p>
          <p className=" text-gray-600 px-3 py-1 border-gray-400 bg-black/10 rounded-xl">
            +243-894-785-585
          </p>
        </div>
      </div>
    );
  }

  // const role = user.role;

  // if (!(role === "seller")) {
  //   return <NotAuthorizedComponent />;
  // }
  const shops = await getShopsByID(user.id);

  if (shops.length < 1) {
    return <NoShopFind />;
  }

  return (
    <div>
      Dashboard Seller Page for more infos.
      <br />
      <br></br>
      <ShopDefaultSelect shops={shops} />
    </div>
  );
};

export default DashboardSellerPage;
