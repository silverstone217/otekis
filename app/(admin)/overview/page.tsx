import { getUser } from "@/actions/actions";
import React from "react";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import OverviewMainComponent from "@/components/admins/overview/MainComponent";
import {
  get_sales_week,
  get_today_sales,
  get_total_product,
  get_total_sales,
  get_total_shops,
  get_total_shops_Per_month,
  get_total_users,
  get_weekly_benefits,
  ProductsByCategoryType,
} from "@/actions/adminsActions";

const OverviewPage = async () => {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  const total_sales = await get_total_sales();
  const today_sales = await get_today_sales();
  const weekly_benefit = await get_weekly_benefits();
  const total_users = await get_total_users();

  const total_product = (await get_total_product()) as ProductsByCategoryType[];
  const sales_Week = await get_sales_week();

  const totalsShopThisMonth = await get_total_shops_Per_month();
  const totalShopsAndNew = await get_total_shops();

  return (
    <div>
      <OverviewMainComponent
        total_sales={total_sales.total_sales}
        today_sales={today_sales.today_sales}
        weekly_benefit={weekly_benefit.weekly_benefits}
        total_users={total_users.total_users}
        total_product={total_product}
        sales_Week={sales_Week}
        total_shops={totalShopsAndNew.total_shops}
        total_shopsPerMonths={totalsShopThisMonth.total_shops}
      />
    </div>
  );
};

export default OverviewPage;
