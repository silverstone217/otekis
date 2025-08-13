import NavMenuDeliverySection from "@/components/admins/delivrery/NavMenu";
import React from "react";

interface DelyveryProps {
  children: React.ReactNode;
}

function Delivertlayout({ children }: DelyveryProps) {
  return (
    <div className="py-2">
      <NavMenuDeliverySection />
      <main className="py-4">{children}</main>
    </div>
  );
}

export default Delivertlayout;
