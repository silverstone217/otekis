import { getUser } from "@/actions/actions";
import { exChangeRate, getCurrencySymbol } from "@/actions/companyAction";
import { getDeliveryMen } from "@/actions/deliverymenActions";
import { getOrderById } from "@/actions/OrdersActions";
import MainViewOrder, {
  OrderProps,
} from "@/components/admins/clients-orders/MainViewOrder";
import { prisma } from "@/lib/prisma";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import React, { Suspense } from "react";

const getDeliveryCompanyById = async (id: string) => {
  const company = await prisma.deliveryCompany.findUnique({
    where: {
      id,
    },
  });
  return company;
};

async function OrderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  if (!id)
    return (
      <div>
        <p>404</p>
        <p>Rien trouvé</p>
      </div>
    );

  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const order = await getOrderById(id);
  const agents = await getDeliveryMen();

  if (!order) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <p className="text-2xl max-w-lg text-pretty mx-auto text-gray-600">{`Cette commande avec ce numero: ${id} n'existe pas.`}</p>
      </div>
    );
  }

  const currency = await getCurrencySymbol();
  const exchange = await exChangeRate();
  const deliveryInfo = order.deliveryOrder;
  const { deliveryOrder, ...orderSimple } = order;
  const companyDelivery = deliveryOrder?.deliveryCompanyId
    ? await getDeliveryCompanyById(deliveryOrder?.deliveryCompanyId)
    : null;

  return (
    <div className="w-full">
      <Suspense fallback={<p>chargement...</p>}>
        <MainViewOrder
          order={orderSimple}
          agents={agents}
          exchange={exchange}
          currency={currency}
          deliveryInfo={deliveryInfo}
          companyDelivery={companyDelivery}
        />
      </Suspense>
    </div>
  );
}

export default OrderPage;
