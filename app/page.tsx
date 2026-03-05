import { getProductsWithArticles, getUser } from "@/actions/actions";
import { isUserHasShop } from "@/actions/shopActions";
import Footer from "@/components/home/Footer";
import MainHomeComponent from "@/components/home/MainHomeComponent";
import { prisma } from "@/lib/prisma";
import { siteName } from "@/utils/data";
import { shuffleArray } from "@/utils/functions";
import { capitalizeText } from "@/utils/shopFunctions";
import { Metadata } from "next";

const siteCapName = siteName && capitalizeText(siteName);

export const metadata: Metadata = {
  title: siteName
    ? `${siteCapName} - business autrement!`
    : "OTEKIS - business autrement!",
  keywords: [
    "boutique",
    "shop",
    "RDC",
    "vêtements",
    "accessoires",
    "vente",
    "cosmetiques",
    "chaussures",
    "business",
  ],
  description:
    "Nouvelle façon de créer un business, prener de l'elan et transformer tout, en un clique et tout cela depuis chez vous sur Otekis",
  metadataBase: new URL("https://www.otekis.com"),

  openGraph: {
    type: "website",
    title: "Otekis",
    description: "Découvrez les meilleurs produits en RDC.",
    url: "https://www.otekis.com",
    siteName: "Otekis",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  // const user = await getUser();

  const products = await getProductsWithArticles();
  const filterdeProducts = !products
    ? []
    : shuffleArray(products).filter(
        (itm) => !itm.name.toLocaleLowerCase().includes("test"),
      );

  const user = await getUser();

  // isuser has shop
  const hasShop = user ? await isUserHasShop(user.id) : null;

  return (
    <main className="min-h-dvh w-full flex items-center justify-start flex-col gap-10">
      <MainHomeComponent products={filterdeProducts} hasShop={hasShop} />

      <Footer />
    </main>
  );
}
