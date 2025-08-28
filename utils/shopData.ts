export const shopDataLinks = [
  {
    label: "Accueil",
    value: "/",
  },
  {
    label: "Catalogues",
    value: "/catalogues",
  },

  {
    label: "Vetements",
    value: "/catalogues?type=vetements",
  },
  {
    label: "Chaussures",
    value: "/catalogues?type=chaussures",
  },
  {
    label: "Commandes",
    value: "/commandes",
  },
];

export const shopAccDataLinks = [
  {
    label: "Accueil",
    value: "/",
  },
  {
    label: "Catalogues",
    value: "/catalogues",
  },

  {
    label: "Bijoux",
    value: "/catalogues?type=bijoux",
  },
  {
    label: "Sac",
    value: "/catalogues?type=sac",
  },
  {
    label: "Commandes",
    value: "/commandes",
  },
];

export const shopCosmeticDataLinks = [
  {
    label: "Accueil",
    value: "/",
  },
  {
    label: "Catalogues",
    value: "/catalogues",
  },

  {
    label: "Commandes",
    value: "/commandes",
  },
];

export const ShopAllDataLinks = {
  vetements: shopDataLinks,
  accessoires: shopAccDataLinks,
  cosmetiques: shopCosmeticDataLinks,
};

export const fontOptions = [
  { label: "Lato", value: "Lato" },
  { label: "Poppins", value: "Poppins" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "Nunito", value: "Nunito" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Alegreya SC", value: "Alegreya SC" },
  { label: "Quantico", value: "Quantico" },
  { label: "Orbitron", value: "Orbitron" },
  { label: "Turret Road", value: "Turret Road" },
  { label: "Atma", value: "Atma" },
  { label: "Hahmlet", value: "Hahmlet" },
  { label: "BioRhyme", value: "BioRhyme" },
  { label: "Gwendolyn", value: "Gwendolyn" },
].sort((a, b) => a.label.localeCompare(b.label, "fr", { sensitivity: "base" }));
