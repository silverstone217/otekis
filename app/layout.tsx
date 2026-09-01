import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import CinetPayLoader from "@/lib/CinetPayLoader";
// import { prisma } from "@/lib/prisma";
import { setupCompanyPrefs } from "@/actions/companyAction";
// import { OrderCountProvider } from "@/components/admins/clients-orders/OrderCountContext";
// VERCEL INFO
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.otekis.com"),
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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
