import NavSection from "@/components/admins/clients-orders/NavSection";
import React from "react";

type LayoutProps = {
  children: React.ReactNode;
};

function Orderlayout({ children }: LayoutProps) {
  return (
    <div className="py-2">
      <NavSection />
      <div className="py-4" />
      {children}
    </div>
  );
}

export default Orderlayout;
