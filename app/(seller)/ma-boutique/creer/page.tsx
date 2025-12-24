import NoUserComponent from "@/components/NoUserComponent";
import AddNewShopForm from "@/components/seller/create/AddNewShopForm";
import { getUser } from "@/actions/actions";
import React from "react";
import { getCompanyPreference } from "@/actions/companyAction";
import BannedUserSeller from "@/components/BannedUserSeller";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer une boutique en ligne — Otekis",
  description:
    "Créez votre boutique en ligne sur Otekis et commencez à vendre facilement en RDC, sans gérer les stocks ni la livraison.",

  keywords: [
    "créer boutique en ligne",
    "ouvrir boutique en ligne RDC",
    "ecommerce RDC",
    "vendeur en ligne",
    "otekis",
    "créer shop",
    "business en ligne RDC",
  ],

  alternates: {
    canonical: "https://www.otekis.com/ma-boutique/creer",
  },

  openGraph: {
    type: "website",
    title: "Créer une boutique en ligne — Otekis",
    description:
      "Lancez votre boutique en ligne sur Otekis et vendez vos produits facilement en RDC.",
    url: "https://www.otekis.com/ma-boutique/creer",
    siteName: "Otekis",
    images: [
      {
        url: "https://www.otekis.com/images/oteki-logo.png",
        width: 800,
        height: 600,
        alt: "Créer une boutique en ligne sur Otekis",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Créer une boutique en ligne — Otekis",
    description:
      "Créez votre boutique en ligne sur Otekis et commencez à vendre en RDC.",
    images: ["https://www.otekis.com/images/oteki-logo.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

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
