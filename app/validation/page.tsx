import ValidationForm from "@/components/validation/ValidationForm";
import { Metadata } from "next";
import Image from "next/image";
import logo from "@/public/images/oteki-logo.png";
import { siteName } from "@/utils/data";

export const metadata: Metadata = {
  title: "Validation de la commande",
  description: "Validez la livraison d'une commande avec le code secret client",
};

interface ValidationPageProps {
  searchParams: Promise<{ order?: string; secret?: string }>;
}

export default async function ValidationPage({
  searchParams,
}: ValidationPageProps) {
  const params = await searchParams;
  const orderId = params.order ?? "";
  const secretCode = params.secret ?? "";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="flex mb-6 items-center gap-1">
        <Image
          src={logo}
          alt="Logo de l'entreprise"
          priority
          className="object-cover w-10 h-auto shrink-0"
        />
        <span className="capitalize text-xl font-bold">{siteName}</span>
      </div>

      <ValidationForm initialOrderId={orderId} initialSecret={secretCode} />
    </main>
  );
}
