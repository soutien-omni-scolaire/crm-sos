import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eleve = await prisma.eleve.findUnique({
      where: { id: params.id },
      include: {
        famille: true,
        centre: true,
        inscriptions: {
          orderBy: {
            dateDebut: "desc",
          },
        },
      },
    });

    if (!eleve) {
      return NextResponse.json(
        { error: "Eleve not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(eleve);
  } catch (error) {
    console.error("Error fetching eleve:", error);
    return NextResponse.json(
      { error: "Failed to fetch eleve" },
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

    const eleve = await prisma.eleve.update({
      where: { id: params.id },
      data: body,
      include: {
        famille: true,
        centre: true,
      },
    });

    return NextResponse.json(eleve);
  } catch (error) {
    console.error("Error updating eleve:", error);
    return NextResponse.json(
      { error: "Failed to update eleve" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.eleve.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Eleve deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting eleve:", error);
    return NextResponse.json(
      { error: "Failed to delete eleve" },
      { status: 500 }
    );
  }
}
