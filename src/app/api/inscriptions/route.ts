import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      eleveId,
      centreId,
      typeOffre,
      formule,
      matieres,
      dateDebut,
      dateFin,
      commentaire,
    } = body;

    if (!eleveId || !centreId || !typeOffre || !dateDebut) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: eleveId, centreId, typeOffre, dateDebut",
        },
        { status: 400 }
      );
    }

    const inscription = await prisma.inscription.create({
      data: {
        eleveId,
        centreId,
        typeOffre,
        formule,
        matieres,
        dateDebut: new Date(dateDebut),
        dateFin: dateFin ? new Date(dateFin) : undefined,
        commentaire,
        statut: "en_cours",
      },
      include: {
        eleve: {
          include: {
            famille: true,
          },
        },
        centre: true,
      },
    });

    return NextResponse.json(inscription, { status: 201 });
  } catch (error) {
    console.error("Error creating inscription:", error);
    return NextResponse.json(
      { error: "Failed to create inscription" },
      { status: 500 }
    );
  }
}
