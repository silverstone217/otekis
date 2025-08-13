import {
  exChangeRate,
  getCompanyPreference,
  getCurrencySymbol,
  getShopsWithAmountToTransfer,
  TotalAmountCompany,
} from "@/actions/companyAction";
import { CardInfosSoldes } from "@/components/admins/finances/transfert/ChangeCurenncyComponent";

import React, { Suspense } from "react";
import MainTable from "./MainTable";
import { getAllWithdrawalHistory } from "@/actions/transfertAction";

async function TransfertPage() {
  const companyPrefs = await getCompanyPreference()!;
  const shops = await getShopsWithAmountToTransfer();
  const exChaneRateAmount = await exChangeRate();
  const currencySymbol = await getCurrencySymbol();

  const amountToPay = shops.reduce(
    (acc, shop) =>
      acc + (currencySymbol === "$" ? shop.benefit : shop.benefitCDF),
    0
  );

  const totalShops = shops.length;
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
    </div>
  );
}

export default TransfertPage;
