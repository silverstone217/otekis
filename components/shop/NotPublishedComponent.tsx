"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotShopStatusFind() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-lg w-full text-center p-8">
        <CardHeader>
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <CardTitle className="text-3xl font-bold">
            Oups ! Page Non Trouvée
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600">
            {`  Nous sommes désolés, mais la boutique que vous recherchez n'existe
              pas.`}
          </CardDescription>
          <CardDescription className="mt-1 text-gray-500">
            {` Vérifiez l'URL ou retournez à la page d'accueil.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Link href="/" passHref>
            <Button variant="outline" className="w-full">
              {`  Retourner à l'accueil`}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

export const IsShopBanOrNotPublished = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full text-center p-8">
        <CardHeader>
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <CardTitle className="text-2xl font-semibold">
            Boutique non disponible
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600">
            {`Cette boutique n'est pas disponible pour le moment.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" className="w-full">
              {` Retourner à l'accueil`}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};
