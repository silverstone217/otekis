// app/api/cinetpay/notify/route.ts (Next.js 13 App Router)
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const cpm_trans_id = formData.get("cpm_trans_id");
  const cpm_site_id = formData.get("cpm_site_id");
  const status = formData.get("cpm_trans_status"); // exemple de champ

  // TODO: vérifier la validité des données, sécuriser la requête

  // TODO: vérifier dans ta base que la transaction existe et mettre à jour son statut

  console.log("Notification CinetPay reçue :", { cpm_trans_id, cpm_site_id, status });

  // Répondre 200 OK pour confirmer la réception
  return NextResponse.json({ message: "Notification reçue" }, { status: 200 });
}

export async function GET() {
  // CinetPay fait un ping GET pour vérifier la disponibilité
  return NextResponse.json({ message: "Notify URL active" }, { status: 200 });
}
