"use client";
import { Shop, Preferences, Contact } from "@prisma/client";
import React, { useEffect, useState } from "react";

// footer template
import FirstFooter from "@/components/new-shop/templates/first/ShopFooter";
import SecondFooter from "@/components/new-shop/templates/second/ShopFooter";
import ThirdFooter from "@/components/new-shop/templates/third/ShopFooter";
import FourthFooter from "@/components/new-shop/templates/fourth/ShopFooter";

type Props = {
  shop: Shop;
  preference: Preferences;
  contacts: Contact | null;
};

const FOOTERS = [FirstFooter, SecondFooter, ThirdFooter, FourthFooter];

const ShopFooter = ({ shop, preference, contacts }: Props) => {
  //   const { data: session } = useSession();
  //   const user = session?.user;
  const [isClient, setIsClient] = useState(false);
  const CurrentFooter = FOOTERS[Number(preference.Footer)] || FirstFooter;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <CurrentFooter shop={shop} preference={preference} contacts={contacts} />
  );
};

export default ShopFooter;
