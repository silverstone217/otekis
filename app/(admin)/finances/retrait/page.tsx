import { getUser } from "@/actions/actions";
import {
  getAllProductSoldAmount,
  getCompanyBenefit,
  getCompanyDeliveryPriceWithdrawHistory,
  getCompanyPreference,
  getCompanyWithdrawHistory,
  getCurrencySymbol,
} from "@/actions/companyAction";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import React, { Suspense } from "react";
import MainComponent from "./MainComponent";

const RetraitPage = async () => {
  const user = await getUser();

  if (!user || !user.role.includes("admin")) {
    return <NotAuthorizedComponent />;
  }

  const widthdraw = await getCompanyWithdrawHistory();
  const currencySymbol = await getCurrencySymbol();
  const companyPrefs = await getCompanyPreference();
  const companyBenefit = await getCompanyBenefit();

  const deliveryWidthdraw = await getCompanyDeliveryPriceWithdrawHistory();

  const productSold = await getAllProductSoldAmount();

  if (!companyPrefs || companyBenefit === null) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6 overflow-hidden flex flex-col">
      <Suspense>
        <MainComponent
          currencySymbol={currencySymbol}
          companyBenefit={companyBenefit}
          withdraw={widthdraw}
          companyPrefs={companyPrefs}
          productSold={productSold}
          deliveryWidthdraw={deliveryWidthdraw}
        />
      </Suspense>
    </div>
  );
};

export default RetraitPage;
