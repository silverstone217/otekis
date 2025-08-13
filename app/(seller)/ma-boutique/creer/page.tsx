import NoUserComponent from "@/components/NoUserComponent";
import AddNewShopForm from "@/components/seller/create/AddNewShopForm";
import { getUser } from "@/actions/actions";
import React from "react";

const NewShopPage = async () => {
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
          {`Veuillez contacter votre administrateur pour plus d'information.`}
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
