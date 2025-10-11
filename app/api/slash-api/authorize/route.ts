// /app/api/login/route.ts
import { generateToken } from "@/lib/slash-mobile/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  // Exemple de validation simple
  if (!username) {
    return NextResponse.json(
      { success: false, message: "Missing username" },
      { status: 400 }
    );
  }

  const token = generateToken(username);

  return NextResponse.json(
    {
      success: true,
      token, // <-- le token envoyé au client mobile
      user: { id: username, username },
    },
    { status: 200 }
  );

  return NextResponse.json(
    { success: false, message: "Invalid credentials" },
    { status: 401 }
  );
}
