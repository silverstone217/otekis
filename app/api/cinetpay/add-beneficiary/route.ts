import { getTokenCinetPay } from "@/lib/cinetpay"; // Assurez-vous que getTokenCinetPay est bien définie et fonctionne
import { NextResponse } from "next/server";

export interface BeneficiaryType {
  prefix: string; // ex: "225"
  phone: string; // ex: "01020304"
  name: string;
  surname: string;
  email: string;
}

interface RequestBody {
  beneficiaries: BeneficiaryType[];
}

export async function POST(request: Request) {
  try {
    const { beneficiaries } = (await request.json()) as RequestBody;

    if (
      !beneficiaries ||
      !Array.isArray(beneficiaries) ||
      beneficiaries.length === 0
    ) {
      return NextResponse.json(
        { error: "Liste de bénéficiaires invalide" },
        { status: 400 }
      );
    }

    const token = await getTokenCinetPay();

    // --- DEBUT DE LA MODIFICATION ---

    // 1. Convertir le tableau de bénéficiaires en chaîne JSON
    const beneficiariesJsonString = JSON.stringify(beneficiaries);

    // 2. Créer les paramètres URL encodés
    const params = new URLSearchParams();
    params.append("data", beneficiariesJsonString); // La clé doit être 'data'

    // Appel à l'API CinetPay
    const response = await fetch(
      `https://client.cinetpay.com/v1/transfer/contact?token=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // MODIFIÉ
        },
        body: params.toString(), // MODIFIÉ
      }
    );

    // --- FIN DE LA MODIFICATION ---

    const data = await response.json();

    // Le support Postman indique code: '0' pour succès.
    // L'erreur OPERATION_ERROR avait code: '-1'.
    if (data.code !== "0" && data.code !== 0) {
      // CinetPay peut renvoyer '0' en string ou number
      console.error("Erreur API CinetPay:", data);
      return NextResponse.json(
        { error: data.message || data.error || "Erreur OPERATION_ERROR" }, // data.error peut contenir le message
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return NextResponse.json(
      {
        error:
          (error as Error).message || "Une erreur inattendue est survenue.",
      },
      { status: 500 }
    );
  }
}
