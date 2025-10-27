export const ColorsData = [
  {
    value: "red",
    label: "Rouge",
  },
  {
    value: "blue",
    label: "Bleu",
  },
  {
    value: "green",
    label: "Vert",
  },
  {
    value: "yellow",
    label: "Jaune",
  },
  {
    value: "orange",
    label: "Orange",
  },
  {
    value: "purple",
    label: "Violet",
  },
  {
    value: "pink",
    label: "Rose",
  },
  {
    value: "brown",
    label: "Brun",
  },
  {
    value: "gray",
    label: "Gris",
  },
  {
    value: "black",
    label: "Noir",
  },
  {
    value: "white",
    label: "Blanc",
  },
  {
    value: "#FFD700",
    label: "Or",
  },
  {
    value: "#C0C0C0",
    label: "Argent",
  },
  {
    value: "#CD7F32",
    label: "Bronze",
  },
  {
    value: "multicolor",
    label: "Multicolore",
  },
  {
    value: "other",
    label: "Autre",
  },
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
