import {
  exChangeRate,
  getAllSupplierMoneyMade,
  getCompanyPreference,
  getCurrencySymbol,
  getShopsWithAmountToTransfer,
  TotalAmountCompany,
} from "@/actions/companyAction";
import { CardInfosSoldes } from "@/components/admins/finances/transfert/ChangeCurenncyComponent";

import React, { Suspense } from "react";
import MainTable from "./MainTable";
import { getAllWithdrawalHistory } from "@/actions/transfertAction";
import { prisma } from "@/lib/prisma";
import SuppliersToPayList from "@/components/admins/finances/transfert/SuppliersToPayList";
import { paySupplier } from "@/actions/paySupplier";

async function TransfertPage() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { supplierBenefitAmount: { gt: 0.001 } },
        { supplierBenefitAmountCDF: { gt: 0.001 } },
      ],
    },
    select: {
      id: true,
      name: true,
      tel: true,
      supplierBenefitAmount: true,
      supplierBenefitAmountCDF: true,
    },
  });

  // Les Decimal Prisma ne peuvent pas être passés à un Client Component
  const suppliers = users.map((u) => ({
    ...u,
    supplierBenefitAmount: u.supplierBenefitAmount.toString(),
    supplierBenefitAmountCDF: u.supplierBenefitAmountCDF.toString(),
  }));

  const companyPrefs = await getCompanyPreference()!;
  const shops = await getShopsWithAmountToTransfer();
  const exChaneRateAmount = await exChangeRate();
  const currencySymbol = await getCurrencySymbol();

  const amountToPay = shops.reduce(
    (acc, shop) =>
      acc + (currencySymbol === "$" ? shop.benefit : shop.benefitCDF),
    0,
  );

  const totalShops = shops.length;
  const supplierBalance = await getAllSupplierMoneyMade();

  const totalBalance = await TotalAmountCompany();
  const allWidithdraw = await getAllWithdrawalHistory();

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6">
      <div className="w-full grid md:grid-cols-1 gap-4 ">
        <div></div>
        <CardInfosSoldes
          amountToPay={amountToPay}
          totalShops={totalShops}
          totalBalance={totalBalance}
          currencySymbol={currencySymbol}
          supplierBalance={supplierBalance}
        />
      </div>
      {/* table transfert */}
      <div className="w-full mt-6"></div>
      <Suspense fallback={<p>Chargement...</p>}>
        <MainTable
          shops={shops}
          currencySymbol={currencySymbol}
          allWidithdraw={allWidithdraw}
        />
      </Suspense>

      <Suspense fallback={<p>Chargement...</p>}>
        <SuppliersToPayList
          suppliers={suppliers}
          currency={currencySymbol === "$" ? "USD" : "CDF"}
          onPay={paySupplier}
          exchange={exChaneRateAmount}
        />
      </Suspense>
    </div>
  );
}

export default TransfertPage;
