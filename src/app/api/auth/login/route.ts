import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Le mot de passe est défini via la variable d'environnement CRM_PASSWORD
    // Par défaut: "SOS2024!" (à changer en production)
    const correctPassword = process.env.CRM_PASSWORD || "SOS2024!";

    if (password !== correctPassword) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Créer un token simple (hash du mot de passe + timestamp)
    const token = Buffer.from(`sos-auth:${Date.now()}`).toString("base64");

    const response = NextResponse.json({ success: true });

    // Cookie httpOnly sécurisé, valable 7 jours
    response.cookies.set("sos-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
