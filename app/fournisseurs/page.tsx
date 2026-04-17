import { getUser } from "@/actions/actions";
import SupplierView from "@/components/supplier/SupplierView";
import React from "react";

async function page() {
  const user = await getUser();

  if (!user) return null;

  return (
    <div>
      <SupplierView />
    </div>
  );
}

export default page;
