export function verifyAddressFormat(
  address: string,
): true | "format incorrect" {
  if (!address || typeof address !== "string") {
    return "format incorrect";
  }

  const parts = address.split(",").map((part) => part.trim());

  // Vérifie qu'il y a exactement 4 parties ou plus et aucune n'est vide
  if (parts.length > 3 || parts.some((part) => part.length === 0)) {
    return "format incorrect";
  }

  // Vérifie que le premier élément correspond au format numéro suivi optionnellement de lettres ou chiffres
  const numberPart = parts[0];
  const numberRegex = /^\d+\s*[-]?\s*[a-zA-Z0-9]*$/;

  if (!numberRegex.test(numberPart)) {
    return "format incorrect";
  }

  return true;
}

export type DeliveryPriceByDeliveryChoiceType = {
  deliveryChoice: string | "self-pick-up";
  address: string | "" | null;
};

const ExpressKinZoneA = {
  zone: "Funa",
  deliveryPrice: 5,
  communes: [
    "bumbu",
    "makala",
    "selembao",
    "kasa-vubu",
    "ngiri-ngiri",
    "bandalungwa",
    "kalamu",
  ],
};

const ExpressKinZoneB = {
  zone: "Mont-Amba",
  deliveryPrice: 8,
  communes: ["limete", "lemba", "ngaba", "kinsenso", "matete"],
};

const ExpressKinZoneC = {
  zone: "Lukunga",
  deliveryPrice: 6,
  communes: [
    "barumbu",
    "gombe",
    "kinshasa",
    "kintambo",
    "lingwala",
    "ngaliema",
  ],
};

const ExpressKinZoneD = {
  zone: "Tshangu",
  deliveryPrice: 10,
  communes: ["kimbanseke", "masina", "ndjili", "nsele", "maluku"],
};

const ExpressKinZones = [
  ExpressKinZoneA,
  ExpressKinZoneB,
  ExpressKinZoneC,
  ExpressKinZoneD,
];

/**
 * Trouve le prix de livraison selon choix et adresse
 */
export function deliveryPriceByDeliveryChoice({
  deliveryChoice,
  address,
}: DeliveryPriceByDeliveryChoiceType): number | string {
  if (!address || !deliveryChoice) {
    return "non-specifié";
  }

  // Pick-up sans frais
  if (deliveryChoice === "self-pick-up") {
    return 0;
  }

  // Livraison transkin express forfaitaire
  if (deliveryChoice === "transkin express") {
    return 1;
  }

  // Livraison otekis express forfaitaire
  if (deliveryChoice === "otekis delivery") {
    return 0;
  }

  // Livraison express kin24 basée sur la commune
  if (deliveryChoice === "express kin24") {
    // Extraction de la commune : adresse format "Numero, Avenue, Commune, Ville"
    // On split par "," puis trim et on prend la 3ème partie (index 2)
    const addressParts = address
      .split(",")
      .map((part) => part.trim().toLowerCase());

    if (addressParts.length < 3) {
      // Adresse mal formatée, on ne peut pas déterminer la commune
      return "adresse invalide";
    }

    const commune = addressParts[2];

    // Recherche dans les zones
    const zoneFound = ExpressKinZones.find((zone) =>
      zone.communes.includes(commune),
    );

    if (zoneFound) {
      return zoneFound.deliveryPrice;
    }

    // Commune non trouvée dans les zones définies
    return "zone non couverte";
  }

  // Cas non prévu => return par défaut
  return "non-specifié";
}

export const DIGITAL_ADDRESS = {
  commune: "bandalungwa",
  quartier: "makelele",
  avenue: "Tshanga, 6529",
};

export const DIGITAL_ADDRESS_TEXT = `${DIGITAL_ADDRESS.commune}, ${DIGITAL_ADDRESS.quartier}, ${DIGITAL_ADDRESS.avenue}`;
