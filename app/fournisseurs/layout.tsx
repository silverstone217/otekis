import { getUser } from "@/actions/actions";
import Header from "@/components/supplier/Header";
import SupplierAuthGate from "@/components/supplier/SupplierAuthGate";
import React from "react";

type Props = {
  children: React.ReactNode;
};

async function layout({ children }: Props) {
  const user = await getUser();

  if (!user) return <SupplierAuthGate />;

  return (
    <div>
      <Header />
      <main className="p-4">{children}</main>
    </div>
  );
}

export default layout;
