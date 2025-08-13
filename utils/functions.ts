export const changeName = (name: string | undefined | null) => {
  if (!name) return "NN";

  let slicedName = name.split(" ")[0];
  slicedName = slicedName.slice(0, 2);
  return slicedName.toUpperCase();
};

export const returnRole = (role: string | undefined | null) => {
  if (!role) return "";
  switch (role) {
    case "admin":
      return "Admin";
    case "super_admin":
      return "Super Admin";
    case "delivery":
      return "Delivery";
    case "seller":
      return "Seller";
    case "employee":
      return "Employee";
    default:
      return "";
  }
};
export const returnRoleWith = (role: string | undefined | null) => {
  if (!role) return "";
  switch (role) {
    case "admin":
      return "Admin";
    case "super_admin":
      return "Super Admin";
    case "delivery":
      return "Livreur(euse)";
    case "seller":
      return "Vendeur(euse)";
    case "employee":
      return "Employé(e)";
    case "user":
      return "Client(e)";
    default:
      return "---";
  }
};

export function getBadgeClass(role: string) {
  switch (role.toLowerCase()) {
    case "super_admin":
      return "bg-red-600 text-white";
    case "admin":
      return "bg-black text-white";
    case "user":
      return " bg-gray-300 text-gray-800";
    // case "seller":
    //   return "bg-pink-600 text-gray-400";
    case "employee":
      return "bg-green-600 text-white";
    default:
      return "bg-blue-600 text-white";
  }
}

export const isEmptyString = (str: string) => {
  return str.replace(/ /g, "") === "";
};

// NORMALIZE NAME
export const normalizeProductName = (name: string) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

// Function to Generate a Slug
export const generateSlug = (name: string) => {
  const normalized = normalizeProductName(name);
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

// generate random number
export function generateDigitNumber(nbr: number): string {
  const randomNumber = Math.floor(Math.random() * 1000000);
  return randomNumber.toString().padStart(nbr, "0");
}
// Return value by datavalue-label
type DataArray = { label: string; value: string };
export const returnDataValue = (value: string, data: DataArray[]) => {
  const values = data;
  const found = values.find((elem) => elem.value === value);
  return found?.label.toLocaleLowerCase() ?? "";
};

// get benfits with promotion
export function applyPromotionOnProfit(
  originalProfit: number,
  discountPercentage: number
): number {
  const discountAmount = Number(
    Math.round((originalProfit * discountPercentage) / 100)
  );
  const newProfit = originalProfit - discountAmount;
  return newProfit;
}

// Fonction pour calculer le pourcentage de réduction
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  // if (originalPrice <= 0) {
  //   throw new Error("Le prix original doit être supérieur à zéro.");
  // }

  const discountAmount = originalPrice - discountedPrice;
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100);
  return discountPercentage;
}

// calculate the benefit o
export function calculateBenefitPercentage(
  originalPrice: number,
  discountPercentage: number
) {
  const benefitPercentageAmount = Math.round(
    (originalPrice * discountPercentage) / 100
  );
  return benefitPercentageAmount;
}

// calculate the total price
export function calculateTotalPrice(
  originalPrice: number,
  benefitPercentage: number
): number {
  const benefitPercentageAmount = Math.round(
    (originalPrice * benefitPercentage) / 100
  );
  return originalPrice + benefitPercentageAmount;
}

// generateRandomString
import crypto from "crypto";

export function generateSecureRandomString(): string {
  const digits = "0123456789";
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // const specials = "@$%&#";

  function getRandomChars(charSet: string, count: number): string[] {
    const result: string[] = [];
    const bytes = crypto.randomBytes(count);
    for (let i = 0; i < count; i++) {
      const idx = bytes[i] % charSet.length;
      result.push(charSet[idx]);
    }
    return result;
  }

  const randomDigits = getRandomChars(digits, 5);
  const randomLetters = getRandomChars(letters, 5);
  // const randomSpecials = getRandomChars(specials, 2);

  const combined = [...randomDigits, ...randomLetters];

  // Mélange Fisher-Yates
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;

  // Récupérer les parties de la date
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();

  // Obtenir le mois en toutes lettres, en français
  const month = d.toLocaleDateString("fr-FR", { month: "long" });

  // Retourner au format demandé
  return `${day}-${month}-${year}`;
}

// Random ID FOR ORDER
export function generateRandomOrderId(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // Génère 3 lettres majuscules aléatoires
  let prefix = "";
  for (let i = 0; i < 3; i++) {
    prefix += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Génère 8 caractères alphanumériques aléatoires
  let suffix = "";
  for (let i = 0; i < 9; i++) {
    suffix += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }

  return `${prefix}-${suffix}`;
}

// Is past 2 days ?
export function deuxJoursEcoules(dateInput: string | Date): boolean {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error("Date invalide");
  }

  const maintenant = new Date();
  const diffMs = maintenant.getTime() - date.getTime();

  const deuxJoursEnMs = 2 * 24 * 60 * 60 * 1000;

  return diffMs >= deuxJoursEnMs;
}

// currency simbols
export const returnCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case "USD":
      return "$";

    case "CDF":
      return "CDF";

    default:
      return "$";
  }
};

// return number by percent
export function returnNumberByPercent(
  percent: number | string,
  amount: number
) {
  const percentValue =
    typeof percent === "string" ? parseFloat(percent) : percent;
  return amount - (amount * percentValue) / 100;
}

// return formated money
export function returnFormatedMoney(amount: number): string {
  if (Number.isInteger(amount)) {
    // Nombre entier -> format classique sans décimale
    return amount.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } else {
    // Nombre flottant -> fraction non arrondie, format manuel
    const amountStr = amount.toString(); // ex "2900.585"
    const [integerPart, decimalPart] = amountStr.split(".");

    // formate partie entière avec espaces en milliers
    const formattedInteger = Number(integerPart).toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // si pas de parties décimales, on retourne integer simple
    if (!decimalPart) {
      return formattedInteger;
    }

    // sinon on concatène avec une virgule et décimales telles quelles
    return `${formattedInteger},${decimalPart}`;
  }
}
