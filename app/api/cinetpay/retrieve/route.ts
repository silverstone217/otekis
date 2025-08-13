import { getTokenCinetPay } from "@/lib/cinetpay";
import { NextResponse } from "next/server";

export interface BeneficiaryType {
  prefix: string; // ex: "225"
  phone: string; // ex: "01020304"
  amount: number; // ex: 1000
  client_transaction_id: string;
  notify_url?: string;
  currency?: "USD" | "CDF";
  payment_method?: "card" | "mobile_money";
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

    // Convertir le tableau en JSON string
    const beneficiariesJsonString = JSON.stringify(beneficiaries);

    // Créer les paramètres URL encodés avec la clé 'data'
    const params = new URLSearchParams();
    params.append("data", beneficiariesJsonString);

    const response = await fetch(
      `https://client.cinetpay.com/v1/transfer/money/send/contact?token=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const data = await response.json();

    if (data.code !== "0" && data.code !== 0) {
      console.error("Erreur API CinetPay:", data);
      return NextResponse.json(
        { error: data.message || data.error || "Erreur OPERATION_ERROR" },
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
