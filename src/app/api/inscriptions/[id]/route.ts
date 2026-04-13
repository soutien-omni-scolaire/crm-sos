import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Convert date strings to Date objects if present
    if (body.dateDebut) {
      body.dateDebut = new Date(body.dateDebut);
    }
    if (body.dateFin) {
      body.dateFin = new Date(body.dateFin);
    }

    const inscription = await prisma.inscription.update({
      where: { id: params.id },
      data: body,
      include: {
        eleve: {
          include: {
            famille: true,
          },
        },
        centre: true,
      },
    });

    return NextResponse.json(inscription);
  } catch (error) {
    console.error("Error updating inscription:", error);
    return NextResponse.json(
      { error: "Failed to update inscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inscription.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Inscription deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inscription:", error);
    return NextResponse.json(
      { error: "Failed to delete inscription" },
      { status: 500 }
    );
  }
}
