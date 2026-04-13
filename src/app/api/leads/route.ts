import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const centreId = searchParams.get("centreId");
    const statut = searchParams.get("statut");
    const search = searchParams.get("search");
    const campagneId = searchParams.get("campagneId");

    const where: any = {};

    if (centreId) {
      where.centreId = centreId;
    }

    if (statut) {
      where.statut = statut;
    }

    if (campagneId) {
      where.campagneId = campagneId;
    }

    if (search) {
      where.OR = [
        { prenomParent: { contains: search, mode: "insensitive" } },
        { nomParent: { contains: search, mode: "insensitive" } },
        { telephone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        centre: true,
        creePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      prenomParent,
      nomParent,
      telephone,
      email,
      source,
      centreId,
      niveauScolaire,
      matiereDemandee,
      offreDemandee,
      nombreEnfants,
      scoreUrgence,
      scoreBudget,
      scoreReactivite,
      scorePotentiel,
      campagneId,
      recommandeParId,
      commentaire,
      creeParId,
    } = body;

    if (!prenomParent || !telephone || !source || !centreId || !creeParId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: prenomParent, telephone, source, centreId, creeParId",
        },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        prenomParent,
        nomParent,
        telephone,
        email,
        source,
        centreId,
        niveauScolaire,
        matiereDemandee,
        offreDemandee,
        nombreEnfants: nombreEnfants || 1,
        scoreUrgence: scoreUrgence || 0,
        scoreBudget: scoreBudget || 0,
        scoreReactivite: scoreReactivite || 0,
        scorePotentiel: scorePotentiel || 0,
        campagneId,
        recommandeParId,
        commentaire,
        creeParId,
        statut: "nouveau",
      },
      include: {
        centre: true,
        creePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
