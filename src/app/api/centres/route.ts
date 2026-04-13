import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const centres = await prisma.centre.findMany({
      where: {
        actif: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    return NextResponse.json(centres);
  } catch (error) {
    console.error("Error fetching centres:", error);
    return NextResponse.json(
      { error: "Failed to fetch centres" },
      { status: 500 }
    );
  }
}
