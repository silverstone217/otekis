import { getCompanyPreference } from "@/actions/companyAction";
import { ChangeCurenncyComponent } from "@/components/admins/finances/transfert/ChangeCurenncyComponent";
import React from "react";

async function SettingFinancePage() {
  const companyPrefs = await getCompanyPreference()!;
  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-6">
      <ChangeCurenncyComponent companyPrefs={companyPrefs} />
    </div>
  );
}

export default SettingFinancePage;
