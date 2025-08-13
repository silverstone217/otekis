import { redirect } from "next/navigation";
import React from "react";

function DeliveryOrdersPage() {
  return redirect("/livraisons/livreurs");
}

export default DeliveryOrdersPage;
