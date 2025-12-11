import BannedUserSeller from "@/components/BannedUserSeller";
import NoUserComponent from "@/components/NoUserComponent";
import NoShopFind from "@/components/seller/NoShopFind";
import ShopSellerList from "@/components/seller/ShopSellerList";
import { getUser } from "@/actions/actions";
import { getShopsByUserID } from "@/actions/shopActions";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import { getCompanyPreference } from "@/actions/companyAction";

const MyShopPage = async () => {
  const user = await getUser();

  if (!user) {
    return <NoUserComponent />;
  }

  const otekisPrefs = await getCompanyPreference();

  if (user.isBanned) {
    return <BannedUserSeller otekisPrefs={otekisPrefs} />;
  }

  // const role = user.role;
  // if (!(role === "seller")) {
  //   return <NotAuthorizedComponent />;
  // }

  // get user's shop
  const shops = await getShopsByUserID(user.id);

  if (!shops || shops.length < 1) {
    return <NoShopFind />;
  }

  // render shop details

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out">
      <div
        className="w-full flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between 
  transition-all duration-500 ease-in-out"
      >
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl">
            La section de vos boutiques
          </h2>
          <p className="text-gray-600 lg:text-[17px]">
            {`Pour ajouter et voir, modifier ou supprimer vos boutiques en cliquant sur l'une d'entre elle.`}
          </p>
        </div>
        {/* navigate */}
        <Link
          href={"/ma-boutique/creer"}
          className="w-full lg:w-fit lg:px-4 py-3 bg-primary text-center text-white font-medium border-2 border-primary 
    hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out shadow-md
    flex items-center justify-center gap-4
    "
        >
          <Plus className="w-8 flex-shrink-0" />
          <span>Ajouter un nouvelle boutique</span>
        </Link>
      </div>

      {/* Shops */}
      {/* <AdminsDataTable data={admins} columns={AdminsColumns} /> */}
      <Suspense fallback={<div>loading...</div>}>
        <ShopSellerList shops={shops} />
      </Suspense>

      <p className="text-gray-600 text-sm">
        <strong>{shops.length.toString().padStart(2, "0")} </strong>
        {shops.length > 1 ? "boutiques" : "boutique"} au total
      </p>
    </div>
  );
};

export default MyShopPage;
