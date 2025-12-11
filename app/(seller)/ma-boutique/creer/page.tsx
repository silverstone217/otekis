import NoUserComponent from "@/components/NoUserComponent";
import AddNewShopForm from "@/components/seller/create/AddNewShopForm";
import { getUser } from "@/actions/actions";
import React from "react";
import { getCompanyPreference } from "@/actions/companyAction";
import BannedUserSeller from "@/components/BannedUserSeller";

const NewShopPage = async () => {
  const user = await getUser();

  if (!user) {
    return <NoUserComponent />;
  }

  const otekisPrefs = await getCompanyPreference();

  if (user.isBanned) {
    return <BannedUserSeller otekisPrefs={otekisPrefs} />;
  }

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out box-border">
      <div className="transition-all duration-500 ease-in-out">
        <h2 className="text-2xl font-bold lg:text-4xl">
          Créer une nouvelle boutique
        </h2>
        <p className="text-gray-600 lg:text-[17px]">
          Remplir tous les champs avant de soumettre.
        </p>
      </div>
      {/* form */}
      <AddNewShopForm />
    </div>
  );
};
export default NewShopPage;
