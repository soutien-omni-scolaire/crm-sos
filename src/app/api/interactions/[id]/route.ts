import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Convert date string to Date object if present
    if (body.date) {
      body.date = new Date(body.date);
    }

    const interaction = await prisma.interaction.update({
      where: { id: params.id },
      data: body,
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

    return NextResponse.json(interaction);
  } catch (error) {
    console.error("Error updating interaction:", error);
    return NextResponse.json(
      { error: "Failed to update interaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.interaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Interaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interaction:", error);
    return NextResponse.json(
      { error: "Failed to delete interaction" },
      { status: 500 }
    );
  }
}
