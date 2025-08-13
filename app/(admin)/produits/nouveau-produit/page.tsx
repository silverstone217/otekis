import { getUser } from "@/actions/actions";
import AddProductForm from "@/components/admins/products/AddProductForm";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import React from "react";

const AddProductPage = async () => {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }
  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out box-border">
      <div className="transition-all duration-500 ease-in-out">
        <h2 className="text-2xl font-bold lg:text-4xl">
          Ajouter un nouveau produit
        </h2>
        <p className="text-gray-600 lg:text-[17px]">
          Remplir tous les champs avant de soumettre.
        </p>
        <p className="text-gray-600 lg:text-[17px]">
          Toujours choisir la categorie avant tout les reste.
        </p>
      </div>
      {/* form */}
      <AddProductForm />
    </div>
  );
};

export default AddProductPage;
