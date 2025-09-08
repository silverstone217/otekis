import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import NoUserComponent from "@/components/NoUserComponent";
import { getUser } from "@/actions/actions";
import React from "react";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import OverviewMainComponent from "@/components/admins/overview/MainComponent";

const OverviewPage = async () => {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const role = user.role;
  if (!PERMITED_ROLES.includes(role)) {
    return null;
  }

  return (
    <div>
      <OverviewMainComponent />
    </div>
  );
};

export default OverviewPage;
