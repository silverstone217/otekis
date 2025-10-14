import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const categories = searchParams.get("categories")?.split(",") || [];
  const gender = searchParams.get("gender") || "O";
  const showAds = searchParams.get("showAds") === "true";

  console.log("Preferences reçues :", { categories, gender, showAds });

  // 🔥 Filtrer ou adapter les données selon les prefs

  return NextResponse.json({ categories });
}
