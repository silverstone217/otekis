"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { SupplierSwitch, SupplierTab } from "./SupplierSwitch";

const Products = dynamic(() => import("./products/Products"));
const Orders = dynamic(() => import("./orders/Orders"));
const Stats = dynamic(() => import("./stats/Stats"));

export default function SupplierView() {
  const [tab, setTab] = React.useState<SupplierTab>("products");
  const [isPending, startTransition] = React.useTransition();

  const handleChange = (value: SupplierTab) => {
    startTransition(() => {
      setTab(value);
    });
  };

  return (
    <div className="space-y-4">
      <SupplierSwitch value={tab} onChange={handleChange} />

      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isPending ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
        `}
      >
        {tab === "products" && <Products />}
        {tab === "orders" && <Orders />}
        {tab === "stats" && <Stats />}
      </div>

      {isPending && <LoadingState />}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-muted" />
      ))}
    </div>
  );
}
