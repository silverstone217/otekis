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
import AcceptSellerTermes from "./AcceptSellerTermes";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import { getCompanyPreference } from "@/actions/companyAction";
import BannedUserSeller from "@/components/BannedUserSeller";

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

  const otekisPrefs = await getCompanyPreference();

  if (user.isBanned) {
    return <BannedUserSeller otekisPrefs={otekisPrefs} />;
  }

  if (!slug) {
    return redirect("/ma-boutique");
  }

  // Get shop by slug and render details
  const shop = await getShopBySlug(slug);
  if (!shop) {
    return <div>pas de boutique trouvée.</div>;
  }

  if (shop.userId !== user.id) {
    return <NotAuthorizedComponent />;
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

      {/* IsSellerTermsAccepted */}
      <AcceptSellerTermes shop={shop} />

      {/* form */}
      <ModifyShopSellerForm shop={shop} />

      <DangerZoneSection shop={shop} />
    </div>
  );
};

export default MyShopBySlugPage;
