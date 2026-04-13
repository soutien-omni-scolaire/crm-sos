import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      prenom,
      nom,
      familleId,
      centreId,
      niveauScolaire,
      ecole,
      commentaire,
    } = body;

    if (!prenom || !nom || !familleId || !centreId) {
      return NextResponse.json(
        {
          error: "Missing required fields: prenom, nom, familleId, centreId",
        },
        { status: 400 }
      );
    }

    const eleve = await prisma.eleve.create({
      data: {
        prenom,
        nom,
        familleId,
        centreId,
        niveauScolaire,
        ecole,
        commentaire,
        statut: "actif",
      },
      include: {
        famille: true,
        centre: true,
      },
    });

    return NextResponse.json(eleve, { status: 201 });
  } catch (error) {
    console.error("Error creating eleve:", error);
    return NextResponse.json(
      { error: "Failed to create eleve" },
      { status: 500 }
    );
  }
}
