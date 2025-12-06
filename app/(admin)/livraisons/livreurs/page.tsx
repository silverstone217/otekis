export const dynamic = "force-dynamic";

import { getDeliveryMen } from "@/actions/deliverymenActions";
import { DataTableDeliverymen } from "@/components/admins/delivrery/DeliveryMenMainComponent";
import React, { Suspense } from "react";

async function DeliveryMenPage() {
  const deliverymen = await getDeliveryMen();

  return (
    <div>
      <Suspense fallback={<p>Chargement...</p>}>
        <DataTableDeliverymen data={deliverymen} />
      </Suspense>
    </div>
  );
}

export default DeliveryMenPage;
