"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { OtekisPreferences } from "@/lib/generated/prisma/client";

const BannedUserSeller = ({
  otekisPrefs,
}: {
  otekisPrefs: OtekisPreferences | null;
}) => {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-xl w-full text-center p-8">
        <CardHeader>
          <AlertTriangle
            className="mx-auto mb-4 w-12 h-12 text-red-600"
            aria-hidden="true"
          />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Compte banni
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600">
            Votre compte a été banni. Vous ne pouvez pas accéder à votre espace
            de vendeur actuellement.
          </CardDescription>
          <CardDescription className="mt-1 text-gray-500">
            Veuillez contacter votre administrateur pour plus
            d&apos;information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-700">
            <a
              href={`mailto:${otekisPrefs?.socialEmail || "servigroup.social@gmail.com"}`}
              className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              {otekisPrefs?.socialEmail || "servigroup.social@gmail.com"}
            </a>
            <a
              href="tel:+243813350706"
              className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              {otekisPrefs?.socialPhone || "+243 83 17 18 338"}
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default BannedUserSeller;
