import { redirect } from "next/navigation";
import React from "react";

const OrdersPage = () => {
  redirect("/commandes/en_cours_de_traitement");

  return <div>OrdersPage</div>;
};

export default OrdersPage;
