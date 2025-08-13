import FinanceNavigation from "@/components/admins/finances/FinanceNavigation";
import React from "react";

interface Props {
  children: React.ReactNode;
}

function FinancesLayout({ children }: Props) {
  return (
    <div>
      <FinanceNavigation />
      <main className="pt-4">{children}</main>
    </div>
  );
}

export default FinancesLayout;
