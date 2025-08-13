"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { returnFormatedMoney } from "@/utils/functions";
import {
  OtekisBenefitAmount,
  OtekisPreferences,
  OtekisWithdrawalHistory,
} from "@prisma/client";
import {
  BanknoteArrowDown,
  HandCoins,
  Landmark,
  PackageCheck,
} from "lucide-react";
import React, { Suspense } from "react";
import WithdrawTable from "./WithdrawTable";
import RetrieveMoney from "@/components/admins/finances/retrait/RetrieveMoney";

type Props = {
  currencySymbol: "$" | "CDF";
  withdraw: OtekisWithdrawalHistory[];
  companyPrefs: OtekisPreferences;
  companyBenefit: OtekisBenefitAmount;
  productSold: number;
};

const MainComponent = ({
  withdraw,
  currencySymbol,
  companyBenefit,
  companyPrefs,
  productSold,
}: Props) => {
  const currency = currencySymbol === "$" ? "USD" : "CDF";
  const benefit =
    currency === "USD" ? companyBenefit.benefit : companyBenefit.benefitCDF;

  const totalBalance =
    currency === "USD" ? companyBenefit.amount : companyBenefit.amountCDF;

  return (
    <div className="w-full grid md:grid-cols-1 gap-4 ">
      <CardInfosSoldes
        currencySymbol={currencySymbol}
        productSold={productSold}
        benefit={benefit}
        totalBalance={totalBalance}
      />

      <div className="flex items-center gap-4 flex-wrap justify-center my-10">
        <RetrieveMoney currency={currency} />
        <Button variant={"secondary"}>
          <HandCoins className="size-4 " />
          <span>Payer les employé(e)s</span>
        </Button>
      </div>

      <Suspense fallback={<p>Chargement...</p>}>
        <WithdrawTable withdraw={withdraw} />
      </Suspense>
    </div>
  );
};

export default MainComponent;

// item

// infos soldes
interface CardInfosSoldesProps {
  productSold: number;
  benefit: number;
  totalBalance: number;
  currencySymbol?: string; // '$' ou d'autres symboles
}

export const CardInfosSoldes = ({
  productSold = 20, // Valeurs par défaut
  benefit = 465.0,
  totalBalance = 1465.0,
  currencySymbol = "$",
}: CardInfosSoldesProps) => {
  return (
    <Card className="w-full  shadow rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800">
          {`Vue d'ensemble financière`}
        </CardTitle>
        <CardDescription className="text-gray-500">
          Suivi de vos principaux indicateurs financiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-1">
        {/* Card pour les boutiques */}
        <Card className="flex items-center p-4 border border-gray-200 rounded-md shadow-sm">
          <PackageCheck className="text-blue-600 size-6 mr-3 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-sm font-medium text-gray-500">Produits vendus</p>
            <p className="text-xl font-bold text-gray-900">{productSold}</p>
          </div>
        </Card>

        {/* Card pour le total à payer */}
        <Card className="flex items-center p-4 border border-gray-200 rounded-md shadow-sm">
          <HandCoins className="text-red-600 size-6 mr-3 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-sm font-medium text-gray-500">Benefices</p>
            <p className="text-xl font-bold text-gray-900">
              {returnFormatedMoney(benefit)}{" "}
              <span className="font-mono text-sm text-gray-600">
                {currencySymbol}
              </span>
            </p>
          </div>
        </Card>

        {/* Card pour le solde total */}
        <Card className="flex items-center p-4 border border-gray-200 rounded-md shadow-sm">
          <Landmark className="text-green-600 size-6 mr-3 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-sm font-medium text-gray-500">
              Solde disponible
            </p>
            <p className="text-xl font-bold text-gray-900">
              {returnFormatedMoney(totalBalance)}{" "}
              <span className="font-mono text-sm text-gray-600">
                {currencySymbol}
              </span>
            </p>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
