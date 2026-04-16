import { getShopData } from "@/actions/supplierAction";
import { NextResponse } from "next/server";

export async function GET() {
  const shops = await getShopData();
  return NextResponse.json(shops);
}
