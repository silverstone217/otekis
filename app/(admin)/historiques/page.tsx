import { getUser } from "@/actions/actions";
import { getAllHistoryOrders } from "@/actions/adminsActions";
import { DataTableHistoryOrders } from "@/components/admins/historiy-orders/MainComponent";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import React, { Suspense } from "react";

async function page() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const getHistoryOrders = await (await getAllHistoryOrders()).data;

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out">
      <div
        className="w-full flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between 
      transition-all duration-500 ease-in-out"
      >
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl max-w-lg text-pretty">
            Les commandes de produits effectuées
          </h2>
          <p className="text-gray-600 lg:text-[17px]">
            Pour gerer, voir, modifier les historiques de commandes.
          </p>
        </div>
      </div>

      {/* Historiques des commandes */}
      <Suspense fallback={<p>Chargement...</p>}>
        <DataTableHistoryOrders data={getHistoryOrders} />
      </Suspense>
    </div>
  );
}

export default page;
