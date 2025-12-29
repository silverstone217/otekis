"use server";
import {
  FLEXPAIE_TOKEN,
  FLEXPAIE_URL_API_CHECK_ORDER,
} from "@/utils/envVariables";

export async function checkFlexpaiePaymentAfter30s(
  paymentRef: string
): Promise<boolean> {
  // 1️⃣ attendre 30 secondes côté serveur
  await new Promise((resolve) => setTimeout(resolve, 30000));

  try {
    const response = await fetch(
      `${FLEXPAIE_URL_API_CHECK_ORDER}${paymentRef}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLEXPAIE_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return false;
    }

    const paymentData = await response.json();

    console.log("Flexpaie check (server):", paymentData);

    if (paymentData.code !== "0") {
      return false;
    }

    // ✅ status "0" = paiement confirmé (selon ta logique actuelle)
    if (paymentData.transaction?.status === "0") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Flexpaie check error:", error);
    return false;
  }
}
