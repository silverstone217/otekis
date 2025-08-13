import { getUser } from "@/actions/actions";
import {
  getShopsByUserID,
  getShopsByUserIDWithStats,
} from "@/actions/shopActions";
import NoShopFind from "@/components/seller/NoShopFind";
import React from "react";
import MainComponent from "./MainComponent";
import { getCurrencySymbol } from "@/actions/companyAction";

async function ShopStatsAndProfitPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const currencySimbol = await getCurrencySymbol();
  const shops = await getShopsByUserID(user.id);
  const shopStats = await getShopsByUserIDWithStats(user.id, "USD");
  const ShopStatsCDF = await getShopsByUserIDWithStats(user.id, "CDF");

  // console.log({ sl: ShopStatsCDF[0].salesCount });

  if (!shops || shops.length < 1) {
    return <NoShopFind />;
  }

  return (
    <div>
      <MainComponent
        shops={shops}
        shopStats={shopStats}
        ShopStatsCDF={ShopStatsCDF}
        currencySimbol={currencySimbol}
      />
    </div>
  );
}

export default ShopStatsAndProfitPage;
