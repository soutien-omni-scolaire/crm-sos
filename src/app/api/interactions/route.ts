import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get("leadId");
    const familleId = searchParams.get("familleId");

    const where: any = {};

    if (leadId) {
      where.leadId = leadId;
    }

    if (familleId) {
      where.familleId = familleId;
    }

    const interactions = await prisma.interaction.findMany({
      where,
      include: {
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
        date: "desc",
      },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error("Error fetching interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      date,
      resume,
      prochaineAction,
      leadId,
      familleId,
      creeParId,
    } = body;

    if (!type || !date || !resume || !creeParId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: type, date, resume, creeParId",
        },
        { status: 400 }
      );
    }

    if (!leadId && !familleId) {
      return NextResponse.json(
        { error: "Either leadId or familleId must be provided" },
        { status: 400 }
      );
    }

    const interaction = await prisma.interaction.create({
      data: {
        type,
        date: new Date(date),
        resume,
        prochaineAction,
        leadId,
        familleId,
        creeParId,
      },
      include: {
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

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error("Error creating interaction:", error);
    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    );
  }
}
