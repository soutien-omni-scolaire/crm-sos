import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assigneeId = searchParams.get("assigneeId");
    const statut = searchParams.get("statut");
    const leadId = searchParams.get("leadId");
    const familleId = searchParams.get("familleId");
    const overdue = searchParams.get("overdue") === "true";

    const where: any = {};

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (statut) {
      where.statut = statut;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (familleId) {
      where.familleId = familleId;
    }

    if (overdue) {
      where.dateEcheance = {
        lt: new Date(),
      };
      where.statut = "a_faire";
    }

    const taches = await prisma.tache.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        creePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
          },
        },
      },
      orderBy: {
        dateEcheance: "asc",
      },
    });

    return NextResponse.json(taches);
  } catch (error) {
    console.error("Error fetching taches:", error);
    return NextResponse.json(
      { error: "Failed to fetch taches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      titre,
      description,
      type,
      dateEcheance,
      priorite,
      assigneeId,
      leadId,
      familleId,
      creeParId,
    } = body;

    if (
      !titre ||
      !dateEcheance ||
      !assigneeId ||
      !creeParId
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: titre, dateEcheance, assigneeId, creeParId",
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

    const tache = await prisma.tache.create({
      data: {
        titre,
        description,
        type: type || "autre",
        dateEcheance: new Date(dateEcheance),
        priorite: priorite || "normale",
        assigneeId,
        leadId,
        familleId,
        creeParId,
        statut: "a_faire",
      },
      include: {
        assignee: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        creePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
          },
        },
      },
    });

    return NextResponse.json(tache, { status: 201 });
  } catch (error) {
    console.error("Error creating tache:", error);
    return NextResponse.json(
      { error: "Failed to create tache" },
      { status: 500 }
    );
  }
}
