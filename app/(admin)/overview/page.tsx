// import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
// import NoUserComponent from "@/components/NoUserComponent";
import { getUser } from "@/actions/actions";
import React from "react";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import OverviewMainComponent from "@/components/admins/overview/MainComponent";
import {
  get_today_sales,
  get_total_sales,
  get_total_users,
  get_weekly_benefits,
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

  return (
    <div>
      <OverviewMainComponent
        total_sales={total_sales.total_sales}
        today_sales={today_sales.today_sales}
        weekly_benefit={weekly_benefit.weekly_benefits}
        total_users={total_users.total_users}
      />
    </div>
  );
};

export default OverviewPage;
