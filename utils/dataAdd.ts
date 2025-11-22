export const ColorsData = [
  { value: "red", label: "Rouge" },
  { value: "blue", label: "Bleu" },
  { value: "green", label: "Vert" },
  { value: "yellow", label: "Jaune" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Violet" },
  { value: "pink", label: "Rose" },
  { value: "brown", label: "Brun" },
  { value: "gray", label: "Gris" },
  { value: "black", label: "Noir" },
  { value: "white", label: "Blanc" },

  // 🔵 Variations de bleu
  { value: "#87CEEB", label: "Bleu Ciel" },
  { value: "#00008B", label: "Bleu Foncé" },
  { value: "#003366", label: "Bleu Marine" },
  { value: "#40E0D0", label: "Turquoise" },
  { value: "#5DADEC", label: "Bleu Arctique" },

  // 🟢 Variations de vert
  { value: "#006400", label: "Vert Foncé" },
  { value: "#50C878", label: "Émeraude" },

  // 🔴 Variations de rouge & rose
  { value: "#800020", label: "Bordeaux" },
  { value: "#8B0000", label: "Grenat" },
  { value: "#C72C48", label: "Framboise" },
  { value: "#DE3163", label: "Cerise" },
  { value: "#FF00FF", label: "Fuchsia" },
  { value: "#FF7F50", label: "Corail" },

  // 🟠 Variations orangées / terre
  { value: "#E2725B", label: "Terracotta" },
  { value: "#AF6E4D", label: "Caramel" },
  { value: "#7B3F00", label: "Chocolat" },
  { value: "#6F4E37", label: "Café" },

  // 🟡 Jaunes & proches
  { value: "#F4C430", label: "Safran" },
  { value: "#FFD700", label: "Or" },

  // ⚪ Tons neutres / beiges
  { value: "#FFFFF0", label: "Ivoire" },
  { value: "#FFFDD0", label: "Crème" },
  { value: "#F5F5DC", label: "Beige" },
  { value: "#C2B280", label: "Sable" },
  { value: "#C8AD7F", label: "Nude" },
  { value: "#EAE0C8", label: "Perle" },
  { value: "#D3D3D3", label: "Gris Clair" },
  { value: "#2F2F2F", label: "Gris Foncé" },
  { value: "#483C32", label: "Taupe" },

  // 🟣 Tons violets & pastel
  { value: "#E6E6FA", label: "Lavande" },
  { value: "#E0B0FF", label: "Mauve" },
  { value: "#9966CC", label: "Améthyste" },
  { value: "#FF69B4", label: "Rose Vif" },

  // 🔥 Tons chauds
  { value: "#FA8072", label: "Saumon" },
  { value: "#FFDAB9", label: "Pêche" },

  // 🔥 Métaux & matériaux premium
  { value: "#C0C0C0", label: "Argent" },
  { value: "#CD7F32", label: "Bronze" },
  { value: "#B76E79", label: "Or Rose" },
  { value: "#E5E4E2", label: "Platine" },
  { value: "#878681", label: "Titane" },

  // 💎 Pierres précieuses
  { value: "#0F52BA", label: "Saphir" },
  { value: "#E0115F", label: "Rubis" },

  // 🌈 Spéciaux
  { value: "multicolor", label: "Multicolore" },
  { value: "other", label: "Autre" },
];

export const AdminsPermitData = ["admin", "super_admin", "employee"];

export const ReasonForDeletedProduct = [
  {
    label: "Stock insuffisant",
    value: "Le stock du produit etait inferieur à 1.",
  },
  {
    label: "Produit deffectué",
    value: "Le Produit etait deffectué ou nuisible.",
  },
  {
    label: "Autre",
    value: "Autre raison.",
  },
];

export const AdminOrdersLinkPages = [
  {
    label: "en cours de traitement",
    value: "en_cours_de_traitement",
  },
  {
    label: "en attente de livraison",
    value: "en_attente_de_livraison",
  },
  {
    label: "en cours de livraison",
    value: "en_cours_de_livraison",
  },
  {
    label: "livré",
    value: "livre",
  },
  {
    label: "en cours d'annulation",
    value: "en_cours_d_annulation",
  },
  {
    label: "annulé",
    value: "annule",
  },
  // {
  //   label: "refusé",
  //   value: "refuse",
  // },
  {
    label: "reporté",
    value: "reporte",
  },
  // {
  //   label: "en attente de retour",
  //   value: "en_attente_de_retour",
  // },
  // {
  //   label: "en cours de retour",
  //   value: "en_cours_de_retour",
  // },
  // {
  //   label: "retourné",
  //   value: "retourne",
  // },
];
// .toSorted((a, b) => a.value.localeCompare(b.value));

export const AdminDeliveryLinkPages = [
  {
    label: "Livreurs",
    value: "/livraisons/livreurs",
  },
  {
    label: "Companies",
    value: "/livraisons/companies",
  },
  {
    label: "Commandes",
    value: "/livraisons/commandes",
  },
];

export const AdminOrdersPaimentStatus = [
  {
    label: "En attente de paiement",
    value: "en attente depaiement",
  },
  {
    label: "En cours de confirmation",
    value: "en cours de confirmation",
  },
  {
    label: "Payé",
    value: "payé",
  },
  {
    label: "Annulé",
    value: "annulé",
  },
  {
    label: "Remboursé",
    value: "remboursé",
  },
];

export const PERMITED_ROLES = ["admin", "super_admin", "employee", "employe"];
