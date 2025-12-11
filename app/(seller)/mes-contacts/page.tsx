import NoUserComponent from "@/components/NoUserComponent";
import MainContactsComponent from "@/components/seller/contacts/MainContactsComponent";
import NoShopFind from "@/components/seller/NoShopFind";
import { getUser } from "@/actions/actions";
import { getShopsByUserID } from "@/actions/shopActions";
import React from "react";
import { getCompanyPreference } from "@/actions/companyAction";
import BannedUserSeller from "@/components/BannedUserSeller";

const MyContactsPage = async () => {
  const user = await getUser();

  if (!user) {
    return <NoUserComponent />;
  }

  const otekisPrefs = await getCompanyPreference();

  if (user.isBanned) {
    return <BannedUserSeller otekisPrefs={otekisPrefs} />;
  }

  const shops = await getShopsByUserID(user.id);

  if (!shops || shops.length < 1) {
    return <NoShopFind />;
  }
  // console.log("shops", shops);
  return (
    <div>
      <MainContactsComponent shops={shops} />
    </div>
  );
};

export default MyContactsPage;
