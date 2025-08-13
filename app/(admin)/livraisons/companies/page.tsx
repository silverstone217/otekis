import { getAllDeliveriesComp } from "@/actions/deliveryCompaniesAction";
import { DataTableDeliveryCompany } from "@/components/admins/delivrery/DeliveryCompanyMainComponent";
import React, { Suspense } from "react";

async function DeliveryCompaniesPage() {
  const companies = await getAllDeliveriesComp();

  return (
    <div>
      <Suspense fallback={<p>Chargement...</p>}>
        <DataTableDeliveryCompany data={companies} />
      </Suspense>
    </div>
  );
}
export default DeliveryCompaniesPage;
