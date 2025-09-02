import {
  AlignLeft,
  AlignJustify,
  SquareMenu,
  AlignRight,
  Logs,
  SquareChevronRight,
  ShoppingCart,
  ShoppingBag,
  ShoppingBasket,
  BaggageClaim,
  RectangleEllipsis,
  CircleEllipsis,
} from "lucide-react";
import { BsCart4 } from "react-icons/bs";
import { FaBagShopping } from "react-icons/fa6";

// CATEGORY SECTION SHOP
// clothes
import man1 from "@/public/images/manCat1.jpg";
import woman1 from "@/public/images/womanCat1.jpg";
import man2 from "@/public/images/manCat2.jpg";
import woman2 from "@/public/images/womanCat2.jpg";
import kid1 from "@/public/images/KidCat1.jpg";
import kid2 from "@/public/images/KidCat2.jpg";

// Accessories
import necklace1 from "@/public/images/necklace1.jpg";
import necklace2 from "@/public/images/necklace2.jpg";
import bracelet1 from "@/public/images/bracelet1.jpg";
import bracelet2 from "@/public/images/bracelet2.jpg";
import bag1 from "@/public/images/bag1.jpg";
import bag2 from "@/public/images/bag2.jpg";

// Cosmetics
import lotion1 from "@/public/images/lotion1.jpg";
import lotion2 from "@/public/images/lotion2.jpg";
import parfum1 from "@/public/images/parfum1.jpg";
import parfum2 from "@/public/images/parfum2.jpg";
import lipstic1 from "@/public/images/lipstic1.jpg";
import lipstic2 from "@/public/images/lipstic2.jpg";
import { MenuIconText, MenuIconTwoBarre } from "./MenuIcons";

const DataCatClothes = [
  {
    image: man1,
    image2: man2,
    title: "Homme",
    link: "/catalogues?target=men",
  },
  {
    image: woman1,
    image2: woman2,
    title: "Femme",
    link: "/catalogues?target=women",
  },
  {
    image: kid1,
    image2: kid2,
    title: "Enfant",
    link: "/catalogues?target=children",
  },
];

const DataCatsAccessories = [
  {
    image: necklace1,
    image2: necklace2,
    title: "Collier",
    link: "/catalogues?type=necklaces",
  },
  {
    image: bracelet1,
    image2: bracelet2,
    title: "Bracelets",
    link: "/catalogues?type=bracelets",
  },
  {
    image: bag2,
    image2: bag1,
    title: "Sacs",
    link: "/catalogues?type=bags",
  },
];

const DataCatsCosmetics = [
  {
    image: lotion1,
    image2: lotion2,
    title: "Lotions et crèmes",
    link: "/catalogues?type=lotion",
  },
  {
    image: parfum1,
    image2: parfum2,
    title: "Parfums",
    link: "/catalogues?type=perfume",
  },
  {
    image: lipstic2,
    image2: lipstic1,
    title: "Rouge à levres",
    link: "/catalogues?type=lipstick",
  },
];
export type catShopType =
  | "vetements"
  | "accessoires"
  | "cosmetiques"
  | "autres";
export const returnDataByCatShop = (category: catShopType) => {
  switch (category) {
    case "vetements":
      return DataCatClothes;
    case "accessoires":
      return DataCatsAccessories;
    case "cosmetiques":
      return DataCatsCosmetics;
    default:
      return DataCatClothes;
  }
};

// MENU ICONS
export const MenuIcons = [
  AlignLeft,
  AlignJustify,
  AlignRight,
  Logs,
  SquareChevronRight,
  SquareMenu,
  MenuIconTwoBarre,
  MenuIconText,
  RectangleEllipsis,
  CircleEllipsis,
];

// cart icons
export const CartIcons = [
  ShoppingCart,
  ShoppingBag,
  ShoppingBasket,
  FaBagShopping,
  BsCart4,
  BaggageClaim,
];

// BG COLORS
export const backgroundColors = {
  purple: "#6b46c1", // violet doux et chaleureux
  green: "#38a169", // vert sauge clair, apaisant
  sky_blue: "#63b3ed", // bleu ciel pastel
  blue: "#2b6cb0", // bleu moyen profond

  red: "#e53e3e", // rouge clair, ton chaud et énergique
  pink: "#d53f8c", // rose framboise doux
  orange: "#ed8936", // orange brûlé, sophistiqué
  yellow: "#f6e05e", // jaune doux, pas agressif

  black: "#171717", // noir profond
  gray: "#a0aec0", // gris doux bleuté
  white: "#f7fafc", // blanc cassé, très léger
};
// TEXT COLORS
export const textColorData = {
  light: "#000000",
  dark: "#ffffff",
};

// BTNS COLORS
export const buttonColors = {
  purple: "#7c3aed", // violet vibrant, modern
  green: "#22c55e", // vert clair et frais (emerald)
  sky_blue: "#3b82f6", // bleu lumineux et doux (sky blue)
  blue: "#1e40af", // bleu royal plus profond

  red: "#ef4444", // rouge vif mais non agressif (tomato)
  pink: "#ec4899", // rose chaud (fuchsia)
  orange: "#f97316", // orange éclatant (orange-500)
  yellow: "#eab308", // jaune doré, chaleureux

  black: "#000000", // classique noir pur
  gray: "#6b7280", // gris équilibré (gray-500)
  white: "#f9fafb", // blanc très doux, presque cassé
};

// RADIUS
export const buttonRadiusData = {
  small: "4px",
  medium: "8px",
  large: "16px",
  extra_large: "24px",
  none: "0px",
};

// HERO SECTION
export const HeroSectionData = [
  {
    label: "Image de couverture et texte",
    value: "cover",
  },
  {
    label: "Produit aleatoire",
    value: "random",
  },
  {
    label: "Ne rien afficher",
    value: "",
  },
];

export const bckColorsData = Object.entries(backgroundColors).map(
  ([color]) => ({
    label: color,
    value: backgroundColors[color as keyof typeof backgroundColors],
  })
);

export const ButtonColorsData = Object.entries(buttonColors).map(([color]) => ({
  label: color,
  value: buttonColors[color as keyof typeof buttonColors],
}));

export const ButtonRadiusData = Object.entries(buttonRadiusData).map(
  ([color]) => ({
    label: color,
    value: buttonRadiusData[color as keyof typeof buttonRadiusData],
  })
);
export const TextColorsData = Object.entries(textColorData).map(([color]) => ({
  label: color,
  value: textColorData[color as keyof typeof textColorData],
}));

export const returnButtonradiusText = (label: string) => {
  switch (label) {
    case "small":
      return "Petit";
    case "medium":
      return "Moyen";
    case "large":
      return "Grand";
    case "extra_large":
      return "Très grand";
    case "none":
      return "Aucun";
    default:
      return "Aucun";
  }
};

export const preferenceDefaults = {
  background: "#f7fafc",
  buttonColor: "#000000",
  buttonRadius: "4px",
  buttonTextColor: "#f9fafb",
  shopId: "",
  description: "Parcourez le catalogue et trouvez ce qui vous fait envie!",
  hero: "cover",
  textColor: "#000000",
  title: "Bienvenue dans Ma boutique",
  fontFamily: "Lato",
  logo: "name",
  menuIcon: "0",
  // addded
  Header: "0",
  Hero: "0",
  Popular: "0",
  Footer: "0",
  // template-1 desc
  positionText: "center", //| "top" | "hidden"
  showDescription: true,
};

export const ShopPreferenceDefaults = {
  background: "#f7fafc",
  buttonColor: "#000000",
  buttonRadius: "4px",
  buttonTextColor: "#f9fafb",
  shopId: "",
  description: "Parcourez le catalogue et trouvez ce qui vous fait envie!",
  template: "0",
  textColor: "#000000",
  title: "Bienvenue dans Ma boutique",
  fontFamily: "Lato",
  logo: "name",
  menuIcon: "0",
  // addded
  Header: "0",
  Hero: "0",
  Popular: "0",
  Footer: "0",
  // template-1 desc
  positionText: "center", //| "top" | "hidden"
  showDescription: true,
};

export const HeaderPositions = [
  {
    label: "Fixé en haut",
    value: "fixed",
  },
  {
    label: "Non fixé ou relatif",
    value: "relative",
  },
];

export const HeaderTemplateData = [
  {
    label: "Template 1",
    value: "0",
  },
  {
    label: "Template 2",
    value: "1",
  },
  {
    label: "Template 3",
    value: "2",
  },
  {
    label: "Template 4",
    value: "3",
  },
  {
    label: "Template 5",
    value: "4",
  },
];

export const HeroTemplateData = [
  {
    label: "Template 1",
    value: "0",
  },
  {
    label: "Template 2",
    value: "1",
  },
  {
    label: "Template 3",
    value: "2",
  },
  {
    label: "Ne rien affiché",
    value: "3",
  },
];

export const CategoryTemplateData = [
  {
    label: "Template 1",
    value: "0",
  },
  {
    label: "Template 2",
    value: "1",
  },
  {
    label: "Template 3",
    value: "2",
  },
  {
    label: "Ne rien affiché",
    value: "3",
  },
];
