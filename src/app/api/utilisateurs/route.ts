import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      where: {
        actif: true,
      },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        role: true,
        centreId: true,
      },
      orderBy: {
        prenom: "asc",
      },
    });

    return NextResponse.json(utilisateurs);
  } catch (error) {
    console.error("Error fetching utilisateurs:", error);
    return NextResponse.json(
      { error: "Failed to fetch utilisateurs" },
      { status: 500 }
    );
  }
}
