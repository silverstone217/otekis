"use client";
import { ShopDefaultSelect } from "@/components/seller/SelectWIthOptionsDefaultShop";
import { Shop } from "@prisma/client";
import React, { Suspense, useMemo, useState } from "react";
import StatsAndBenefits, { StatsAndBenefitsProps } from "./data-benefit";
import useSelectDefaultShop from "@/components/seller/SelectDefaultShop";

type Props = {
  shops: Shop[];
  shopStats: StatsAndBenefitsProps[];
  ShopStatsCDF: StatsAndBenefitsProps[];
  currencySimbol: "CDF" | "$";
};

const MainComponent = ({
  shops,
  shopStats,
  ShopStatsCDF,
  currencySimbol,
}: Props) => {
  const defaultShopId = useSelectDefaultShop({ shops });
  const defaultShopStats = useMemo(
    () => shopStats.find((s) => s.id === (defaultShopId ?? 0)),
    [defaultShopId, shopStats]
  );

  const defaultShopStatsCDF = useMemo(
    () => ShopStatsCDF.find((s) => s.id === (defaultShopId ?? 0)),
    [defaultShopId, ShopStatsCDF]
  );
  const returnCurrency = currencySimbol === "$" ? "USD" : "CDF";
  const [currency, setCurrency] = useState<"USD" | "CDF">(returnCurrency);

  return (
    <div>
      <ShopDefaultSelect shops={shops} />
      <br />
      {defaultShopStats && defaultShopStatsCDF && (
        <Suspense fallback={"Chargement..."}>
          <StatsAndBenefits
            defaultShopStats={defaultShopStats}
            defaultShopStatsCDF={defaultShopStatsCDF}
            currency={currency}
            setCurrency={setCurrency}
          />
        </Suspense>
      )}
    </div>
  );
};

export default MainComponent;
