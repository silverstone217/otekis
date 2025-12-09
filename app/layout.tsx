export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { siteName } from "@/utils/data";
import { capitalizeText } from "@/utils/shopFunctions";
import { Toaster } from "@/components/ui/sonner";
import CinetPayLoader from "@/lib/CinetPayLoader";
// import { prisma } from "@/lib/prisma";
import { setupCompanyPrefs } from "@/actions/companyAction";
// import { OrderCountProvider } from "@/components/admins/clients-orders/OrderCountContext";

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

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

// const deleteBadData = async () => {
//   try {
//     const factures = await prisma.facture.deleteMany();
//     console.log("Donnes supprimées");
//   } catch (error) {
//     console.log(error);
//   }
// };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const deletFac = await deleteBadData();
  await setupCompanyPrefs();

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${lato.className} custom-scrollbar relative 
        antialiased scroll-smooth`}
      >
        {/* Charger le script CinetPay globalement */}
        <CinetPayLoader />
        <AuthProvider>
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
