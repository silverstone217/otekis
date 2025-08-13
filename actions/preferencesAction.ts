"use server";
import { prisma } from "@/lib/prisma";
import { getUser } from "./actions";

export const getPrefrenceByShopId = async (shopId: string) => {
  const prefs = await prisma.preferences.findUnique({
    where: { shopId },
  });
  return prefs;
};

type PrefsTypes = {
  background: string;
  buttonColor: string;
  buttonRadius: string;
  buttonTextColor: string;
  shopId: string;
  description: string;
  hero: string;
  textColor: string;
  title: string;
  fontFamily: string;
  logo: string;
  menuIcon: string;
  cartIcon: string;
  Header: string;
  Hero: string;
  positionText: string;
  Category : string;
};
// Add prefs
export const addNewPrefs = async ({
  background,
  buttonColor,
  buttonRadius,
  buttonTextColor,
  shopId,
  description,
  hero,
  textColor,
  title,
  fontFamily,
  logo,
  menuIcon,
  cartIcon,
  Header = "0",
  Hero = "0",
  positionText = "center",
  Category = "0"
}: PrefsTypes) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });
  if (!shop) {
    return {
      message: "Le magasin n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;
  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const newPreferences = await prisma.preferences.create({
    data: {
      background,
      buttonColor,
      buttonRadius,
      buttonTextColor,
      shopId,
      description,
      hero,
      textColor,
      title,
      fontFamily,
      logo,
      menuIcon,
      cartIcon,
      Header,
      Hero,
      positionText,
      Category,
    },
  });

  if (!newPreferences) {
    return {
      message: "Erreur est survenue, reessayez plus tard!",
      data: null,
      error: true,
    };
  }

  return {
    message: "Prferences ajoutées avec succes",
    data: newPreferences,
    error: false,
  };
};

// update prefs
export const updatePrefs = async ({
  background,
  buttonColor,
  buttonRadius,
  buttonTextColor,
  shopId,
  description,
  hero,
  textColor,
  title,
  fontFamily,
  logo,
  menuIcon,
  cartIcon,
  Header = "0",
  Hero = "0",
  positionText = "center",
  Category = "0"
}: PrefsTypes) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });
  if (!shop) {
    return {
      message: "Le magasin n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;
  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const newPreferences = await prisma.preferences.update({
    where: { shopId },
    data: {
      background,
      buttonColor,
      buttonRadius,
      buttonTextColor,
      fontFamily,
      description,
      hero,
      textColor,
      title,
      logo,
      menuIcon,
      cartIcon,
      Header,
      Hero,
      positionText,
      Category,
    },
  });

  if (!newPreferences) {
    return {
      message: "Erreur est survenue, reessayez plus tard!",
      data: null,
      error: true,
    };
  }

  return {
    message: "Prferences modifiées avec succes",
    data: newPreferences,
    error: false,
  };
};

// Contacts
export const getContactsByShopId = async (shopId: string) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });
  if (!shop) {
    return {
      message: "Le magasin n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;
  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const contacts = await prisma.contact.findUnique({
    where: { shopId },
  });
  return {
    message: "Contacts récupérés avec succes",
    data: contacts,
    error: false,
  };
};

type ContactsTypes = {
  shopId: string;
  email: string | undefined;
  phone: string | undefined;
  youtube: string | undefined;
  facebook: string | undefined;
  instagram: string | undefined;
  twitter: string | undefined;
  pinterest: string | undefined;
};
export const upsertContacts = async (conts: ContactsTypes) => {
  const user = await getUser();
  if (!user) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: conts.shopId },
  });
  if (!shop) {
    return {
      message: "Le magasin n'existe pas!",
      error: true,
    };
  }

  const isHisShop = shop.userId === user.id;
  if (!isHisShop) {
    return {
      message: "Pas authorisé à faire ça!",
      error: true,
    };
  }

  const newContacts = await prisma.contact.upsert({
    where: { shopId: conts.shopId },
    update: conts,
    create: {
      shopId: conts.shopId,
      email: conts.email || "",
      phone: conts.phone || "",
      youtube: conts.youtube || "",
      facebook: conts.facebook || "",
      instagram: conts.instagram || "",
      twitter: conts.twitter || "",
      pinterest: conts.pinterest || "",
    },
  });

  if (!newContacts) {
    return {
      message: "Erreur est survenue, reessayez plus tard!",
      data: null,
      error: true,
    };
  }

  return {
    message: "Contacts ajoutés ou modifiés avec succes",
    data: newContacts,
    error: false,
  };
};
