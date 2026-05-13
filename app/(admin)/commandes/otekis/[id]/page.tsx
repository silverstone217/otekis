import React from "react";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import { getOtekisOrder } from "@/actions/admins/orders/adminsOrders";
import MainAdminOrder from "@/components/admins/orders/otekis/MainAdminOrder";

type Props = {
  params: Promise<{ id: string }>;
};

async function OtekisOrderpage({ params }: Props) {
  const { id } = await params;

  if (!id) {
    return <div>Order not found</div>;
  }

  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const order = await getOtekisOrder(id);
  if (!order) {
    return <div>Order not found</div>;
  }

  const products = order.products;
  const shop = order.shop;
  const deliveryInfo = order.deliveryOrder;

  return (
    <div>
      <MainAdminOrder
        order={order}
        shop={shop}
        deliveryInfo={deliveryInfo}
        products={products}
      />
    </div>
  );
}

export default OtekisOrderpage;
