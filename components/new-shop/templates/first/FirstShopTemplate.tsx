import { Preferences, Shop } from "@prisma/client";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import React, { ReactNode } from "react";
import ShopHeader from "../third/ShopHeader";

export interface ShopTemplateType {
  children: ReactNode;
  shop: Shop;
  preferences: Preferences;
  getMyFont: NextFontWithVariable;
}

function FirstShopTemplate({
  children,
  shop,
  getMyFont,
  preferences,
}: ShopTemplateType) {
  return (
    <div
      className="mx-auto
       max-w-7xl"
    >
      {/* header */}
      <ShopHeader getMyFont={getMyFont} shop={shop} preferences={preferences} />

      {/* main content */}
      <main className="py-20">{children}</main>
      {/* footer */}
      <footer>Footer</footer>
    </div>
  );
}

export default FirstShopTemplate;
