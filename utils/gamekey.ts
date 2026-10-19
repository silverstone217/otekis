// utils/gameKey.ts  (SERVEUR UNIQUEMENT)
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { GAME_KEY_PREFIX, normalizeHwid } from "./randonarando";

/**
 * Variables d'environnement à ajouter (valeurs longues et aléatoires) :
 *   GAME_KEY_SECRET=...   (signature HMAC)
 *   GAME_KEY_SALT=...     (sel pour l'empreinte du PC)
 * Générer avec :  openssl rand -hex 32
 */
const getSecrets = () => {
  const secret = process.env.GAME_KEY_SECRET;
  const salt = process.env.GAME_KEY_SALT;
  if (!secret || !salt) {
    throw new Error("GAME_KEY_SECRET et GAME_KEY_SALT doivent être définis");
  }
  return { secret, salt };
};

// Alphabet Crockford (sans I, L, O, U) : pas de confusion 0/O ou 1/I à la saisie
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const toBase32 = (buf: Buffer) => {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
};

/** Empreinte courte du PC : 5 octets -> 8 caractères */
const pcTag = (hwid: string, salt: string) =>
  toBase32(
    createHash("sha256")
      .update(`${salt}|${normalizeHwid(hwid)}`)
      .digest()
      .subarray(0, 4),
  ).slice(0, 6);

/** Signature : 10 octets -> 16 caractères */
const signature = (tag: string, random: string, hwid: string, secret: string) =>
  toBase32(
    createHmac("sha256", secret)
      .update(`${GAME_KEY_PREFIX}|${tag}|${random}|${normalizeHwid(hwid)}`)
      .digest()
      .subarray(0, 9),
  ).slice(0, 14);

/**
 * Génère une clé liée au HWID.
 * Format : RNR-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 *          [  PC (8)  ][ aléatoire (8) ][ signature (16) ]
 */
export const generateGameKey = (hwid: string) => {
  const { secret, salt } = getSecrets();

  const tag = pcTag(hwid, salt);
  const random = toBase32(randomBytes(3)).slice(0, 4);
  const sig = signature(tag, random, hwid, secret);

  const raw = `${tag}${random}${sig}`;
  const groups = raw.match(/.{1,4}/g)!.join("-");

  return `${GAME_KEY_PREFIX}-${groups}`;
};

/** Vérifie qu'une clé correspond bien à ce HWID. */
export const verifyGameKey = (key: string, hwid: string) => {
  try {
    const { secret, salt } = getSecrets();

    const raw = key
      .trim()
      .toUpperCase()
      .replace(new RegExp(`^${GAME_KEY_PREFIX}-?`), "")
      .replace(/[-\s]/g, "");
    if (raw.length !== 24) return false;

    const tag = raw.slice(0, 6);
    const random = raw.slice(6, 10);
    const sig = raw.slice(10);

    if (tag !== pcTag(hwid, salt)) return false;

    const expected = Buffer.from(signature(tag, random, hwid, secret));
    const received = Buffer.from(sig);

    return (
      expected.length === received.length && timingSafeEqual(expected, received)
    );
  } catch {
    return false;
  }
};

/**
 * Retourne l'empreinte du HWID, utilisée pour comparer
 * un ordinateur avec les clés déjà générées.
 */
export const getPcTagForHwid = (hwid: string) => {
  const { salt } = getSecrets();
  return pcTag(normalizeHwid(hwid), salt);
};
