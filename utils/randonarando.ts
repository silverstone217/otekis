// utils/randonarando.ts
// Constantes et helpers utilisables côté client ET côté serveur (pas de "crypto" ici).

export const RANDO_GAME_NAME = "Rando na Rando";

/** Prix du jeu en dollars (converti avec le taux de change côté serveur). */
export const RANDO_GAME_PRICE_USD: number = 0.3;

/** Le produit est retrouvé côté serveur par son nom (insensible à la casse). */
export const RANDO_PRODUCT_NAME = "rando na rando";

/** Code du jeu, placé au début de chaque clé. */
export const GAME_KEY_PREFIX = "RNR";

/**
 * Slug de la boutique autorisée à vendre le jeu.
 * TODO: mettre le slug réel après le développement. `null` = toutes les boutiques.
 */
export const RANDO_ALLOWED_SHOP_SLUG: string | null = null;

// ---------- HWID ----------
// ⚠️ Adapter cette expression au format réel du HWID généré par le jeu.
const HWID_REGEX = /^[A-Z0-9-]{8,64}$/;

export const normalizeHwid = (value: string) =>
  value.trim().toUpperCase().replace(/\s+/g, "");

export const validateHwid = (value: string): string | null => {
  const hwid = normalizeHwid(value);
  if (!hwid) return "Le HWID est requis";
  if (!HWID_REGEX.test(hwid)) {
    return "HWID invalide : 8 à 64 caractères (lettres, chiffres et tirets)";
  }
  return null;
};

// ---------- PAIEMENT ----------
export const validatePaymentNumber = (value: string): string | null => {
  if (!value) return "Le numéro de paiement est requis";
  if (!/^\d{9}$/.test(value)) {
    return "Le numéro doit contenir exactement 9 chiffres, sans 0 ni +243";
  }
  return null;
};

// ---------- CLÉ ----------
/** "RNR-ABCD-EFGH-..." -> "ABCD-EFGH" (repère du PC, contenu dans la clé) */
export const getKeyPcTag = (key: string) => {
  const raw = key
    .replace(new RegExp(`^${GAME_KEY_PREFIX}-`), "")
    .replace(/-/g, "");
  const tag = raw.slice(0, 8);
  return tag.length === 8 ? `${tag.slice(0, 4)}-${tag.slice(4)}` : "";
};

// ---------- STYLE ----------
/** Ajoute de la transparence à une couleur hexadécimale (#RRGGBB). */
export const withAlpha = (color: string, alpha: number) => {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${a}`;
};

// Boutiques permises
export const allowedShopGame: string[] = [
  "nazobetagame",
  "uze-shop",
  // Ajoute ici les slugs des boutiques autorisées
];
