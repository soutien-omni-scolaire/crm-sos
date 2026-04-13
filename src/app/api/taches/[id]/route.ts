import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tache = await prisma.tache.findUnique({
      where: { id: params.id },
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
            email: true,
          },
        },
      },
    });

    if (!tache) {
      return NextResponse.json(
        { error: "Tache not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tache);
  } catch (error) {
    console.error("Error fetching tache:", error);
    return NextResponse.json(
      { error: "Failed to fetch tache" },
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

    // Convert date string to Date object if present
    if (body.dateEcheance) {
      body.dateEcheance = new Date(body.dateEcheance);
    }

    const tache = await prisma.tache.update({
      where: { id: params.id },
      data: body,
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
            email: true,
          },
        },
      },
    });

    return NextResponse.json(tache);
  } catch (error) {
    console.error("Error updating tache:", error);
    return NextResponse.json(
      { error: "Failed to update tache" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.tache.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Tache deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tache:", error);
    return NextResponse.json(
      { error: "Failed to delete tache" },
      { status: 500 }
    );
  }
}
