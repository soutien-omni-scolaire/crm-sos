import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const famille = await prisma.famille.findUnique({
      where: { id: params.id },
      include: {
        centrePrincipal: true,
        eleves: {
          include: {
            inscriptions: {
              orderBy: {
                dateDebut: "desc",
              },
            },
          },
        },
        interactions: {
          include: {
            creePar: {
              select: {
                id: true,
                prenom: true,
                nom: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        taches: {
          include: {
            assignee: {
              select: {
                id: true,
                prenom: true,
                nom: true,
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
        },
        lead: true,
        leadsRecommandes: {
          select: {
            id: true,
            prenomParent: true,
            nomParent: true,
            telephone: true,
            source: true,
            statut: true,
            createdAt: true,
          },
        },
      },
    });

    if (!famille) {
      return NextResponse.json(
        { error: "Famille not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(famille);
  } catch (error) {
    console.error("Error fetching famille:", error);
    return NextResponse.json(
      { error: "Failed to fetch famille" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const famille = await prisma.famille.update({
      where: { id: params.id },
      data: body,
      include: {
        centrePrincipal: true,
      },
    });

    return NextResponse.json(famille);
  } catch (error) {
    console.error("Error updating famille:", error);
    return NextResponse.json(
      { error: "Failed to update famille" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.famille.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Famille deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting famille:", error);
    return NextResponse.json(
      { error: "Failed to delete famille" },
      { status: 500 }
    );
  }
}
