import { getUser } from "@/actions/actions";
import { getAllOrdersByStatus } from "@/actions/OrdersActions";
import {
  DataTableClientsOrders,
  OrderstableType,
} from "@/components/admins/clients-orders/MainClientOrders";
import { AdminOrdersLinkPages, PERMITED_ROLES } from "@/utils/dataAdd";
import { returnDataValue } from "@/utils/functions";
import React, { Suspense } from "react";

async function OrdersByStatusPage(props: {
  params: Promise<{ status: string }>;
}) {
  const params = await props.params;
  const { status } = params;

  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const returnStatus = returnDataValue(status, AdminOrdersLinkPages);
  const orders = (await getAllOrdersByStatus(
    returnStatus
  )) as unknown as OrderstableType[];

  return (
    <div>
      <Suspense fallback={<p>Chargement...</p>}>
        <DataTableClientsOrders data={orders} />
      </Suspense>
    </div>
  );
}

export default OrdersByStatusPage;
