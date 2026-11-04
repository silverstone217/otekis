import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import CinetPayLoader from "@/lib/CinetPayLoader";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
