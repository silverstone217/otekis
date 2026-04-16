export const IsAvailableProducts = [
  {
    label: "Pour tous les vendeurs",
    value: "for_all",
  },
  {
    label: "Indisponible",
    value: "not_available",
  },
  {
    label: "Vendeurs spécifiques",
    value: "specific_sellers",
  },
  {
    label: "Pour soi-même uniquement",
    value: "only_self",
  },
];

export type IsAvailableType =
  | "for_all"
  | "only_self"
  | "specific_sellers"
  | "not_available";
