import NoUserComponent from "@/components/NoUserComponent";
import ModifyShopSellerForm, {
  DangerZoneSection,
} from "@/components/seller/ModifyShopSellerForm";
import { getUser } from "@/actions/actions";
import { CategoriesData } from "@/utils/data";
import { returnDataValue } from "@/utils/functions";
import { getShopBySlug } from "@/actions/shopActions";
import { Store } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const MyShopBySlugPage = async (props: Props) => {
  const params = await props.params;
  const { slug } = params;

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

  if (!slug) {
    return redirect("/ma-boutique");
  }

  // Get shop by slug and render details
  const shop = await getShopBySlug(slug);
  if (!shop) {
    return <div>pas de boutique trouvée.</div>;
  }

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out box-border">
      <div className="flex w-full items-start justify-between gap-y-4 lg:flex-row flex-col">
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl mb-2">
            Modifier la boutique
          </h2>
          <p className="text-gray-600 lg:text-[17px]">
            ID : <strong>{shop.id}</strong>
          </p>
          <p className="text-gray-600 lg:text-[17px]">
            Category :{" "}
            <strong>{returnDataValue(shop.category, CategoriesData)}</strong>
          </p>
          <p className="text-gray-600">
            Status :{" "}
            <strong className="capitalize">
              {shop.isPublished ? "publiée" : "pas publiée"}
            </strong>
          </p>
          <p className="text-gray-600">
            ajouté le{" "}
            {new Date(shop.createdAt).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-600 lg:text-[17px] mt-4">
            Remplir tous les champs avant de soumettre.
          </p>
        </div>
        {/* add items */}
        {/* navigate */}
        <Link
          href={`/${shop.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full lg:w-fit lg:px-6 py-3 bg-primary text-center text-white font-medium border-2 border-primary 
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out shadow-md
        flex items-center justify-center gap-4
        "
        >
          <span>Voire ma boutique</span>
          <Store className="flex-shrink-0 w-8" />
        </Link>
      </div>
      {/* form */}
      <ModifyShopSellerForm shop={shop} />

      <DangerZoneSection shop={shop} />
    </div>
  );
};

export default MyShopBySlugPage;
