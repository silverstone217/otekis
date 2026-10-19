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
      .subarray(0, 5),
  );

/** Signature : 10 octets -> 16 caractères */
const signature = (tag: string, random: string, hwid: string, secret: string) =>
  toBase32(
    createHmac("sha256", secret)
      .update(`${GAME_KEY_PREFIX}|${tag}|${random}|${normalizeHwid(hwid)}`)
      .digest()
      .subarray(0, 10),
  );

/**
 * Génère une clé liée au HWID.
 * Format : RNR-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 *          [  PC (8)  ][ aléatoire (8) ][ signature (16) ]
 */
export const generateGameKey = (hwid: string) => {
  const { secret, salt } = getSecrets();

  const tag = pcTag(hwid, salt);
  const random = toBase32(randomBytes(5)); // 8 caractères
  const sig = signature(tag, random, hwid, secret);

  const raw = `${tag}${random}${sig}`; // 32 caractères
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
    if (raw.length !== 32) return false;

    const tag = raw.slice(0, 8);
    const random = raw.slice(8, 16);
    const sig = raw.slice(16);

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
