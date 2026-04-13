import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const campagnes = await prisma.campagne.findMany({
      include: {
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: {
        dateDebut: "desc",
      },
    });

    // Transform to include counts
    const result = await Promise.all(
      campagnes.map(async (campagne) => {
        const convertedCount = await prisma.lead.count({
          where: {
            campagneId: campagne.id,
            statut: "converti",
          },
        });

        return {
          ...campagne,
          _count: {
            leads: campagne._count.leads,
            leadsConverti: convertedCount,
          },
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching campagnes:", error);
    return NextResponse.json(
      { error: "Failed to fetch campagnes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nom,
      type,
      dateDebut,
      dateFin,
      description,
      objectifLeads,
      budget,
      statut,
    } = body;

    if (!nom || !type || !dateDebut || !dateFin) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: nom, type, dateDebut, dateFin",
        },
        { status: 400 }
      );
    }

    const campagne = await prisma.campagne.create({
      data: {
        nom,
        type,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        description,
        objectifLeads: objectifLeads || 0,
        budget,
        statut: statut || "planifiee",
      },
      include: {
        _count: {
          select: {
            leads: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...campagne,
        _count: {
          leads: campagne._count.leads,
          leadsConverti: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campagne:", error);
    return NextResponse.json(
      { error: "Failed to create campagne" },
      { status: 500 }
    );
  }
}
