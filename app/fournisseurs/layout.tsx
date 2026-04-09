import Header from "@/components/supplier/Header";
import React from "react";

type Props = {
  children: React.ReactNode;
};

async function layout({ children }: Props) {
  return (
    <div>
      <Header />
      <main className="p-4">{children}</main>
    </div>
  );
}

export default layout;
