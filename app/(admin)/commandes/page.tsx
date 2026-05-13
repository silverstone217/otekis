import { getAdminsOrders } from "@/actions/admins/orders/adminsOrders";
import MainAdminOrders from "@/components/admins/orders/MainAdminOrders";
import { redirect } from "next/navigation";
import React from "react";

async function OrdersPage() {
  //redirect("/commandes/en_cours_de_traitement");

  const orders = await getAdminsOrders();

  return <MainAdminOrders orders={orders} />;
}

export default OrdersPage;
