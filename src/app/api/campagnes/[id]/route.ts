import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campagne = await prisma.campagne.findUnique({
      where: { id: params.id },
      include: {
        leads: {
          include: {
            centre: {
              select: {
                id: true,
                nom: true,
                code: true,
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
        },
      },
    });

    if (!campagne) {
      return NextResponse.json(
        { error: "Campagne not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(campagne);
  } catch (error) {
    console.error("Error fetching campagne:", error);
    return NextResponse.json(
      { error: "Failed to fetch campagne" },
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

    const dataToUpdate: any = {};

    if (nom !== undefined) dataToUpdate.nom = nom;
    if (type !== undefined) dataToUpdate.type = type;
    if (dateDebut !== undefined) dataToUpdate.dateDebut = new Date(dateDebut);
    if (dateFin !== undefined) dataToUpdate.dateFin = new Date(dateFin);
    if (description !== undefined) dataToUpdate.description = description;
    if (objectifLeads !== undefined) dataToUpdate.objectifLeads = objectifLeads;
    if (budget !== undefined) dataToUpdate.budget = budget;
    if (statut !== undefined) dataToUpdate.statut = statut;

    const campagne = await prisma.campagne.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        leads: {
          include: {
            centre: {
              select: {
                id: true,
                nom: true,
                code: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(campagne);
  } catch (error) {
    console.error("Error updating campagne:", error);
    return NextResponse.json(
      { error: "Failed to update campagne" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.campagne.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Campagne deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campagne:", error);
    return NextResponse.json(
      { error: "Failed to delete campagne" },
      { status: 500 }
    );
  }
}
