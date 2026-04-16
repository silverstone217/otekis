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

// NAME
export const validateName = (name: string) => {
  if (!name || name.trim().length < 2) {
    return "Le nom doit contenir au moins 2 caractères";
  }
  return null;
};

// DESCRIPTION
export const validateDescription = (desc: string) => {
  if (!desc || desc.trim().length < 5) {
    return "La description doit contenir au moins 5 caractères";
  }
  return null;
};

// IMAGE
export const validateImage = (image: File | null) => {
  if (!image) return "L'image est requise";
  return null;
};

// ARTICLES
export const validateArticles = (articles: any[]) => {
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    if (!a.color) return `Article ${i + 1} : couleur requise`;
    if (!a.size) return `Article ${i + 1} : taille requise`;
  }
  return null;
};

// REQUIRED STRING
export const validateRequired = (value: string, field: string) => {
  if (!value || value.trim() === "") {
    return `${field} est requis`;
  }
  return null;
};

// ADDRESS (avenue + numéro)
export const validateAvenue = (avenue: string) => {
  const regex = /^.+,\s*\d+[a-zA-Z]?$/;
  if (!regex.test(avenue)) {
    return "Format invalide (ex: Samba, 12 ou Samba, 12C)";
  }
  return null;
};
