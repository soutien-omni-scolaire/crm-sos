import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const centreId = searchParams.get("centreId");
    const statut = searchParams.get("statut");
    const search = searchParams.get("search");

    const where: any = {};

    if (centreId) {
      where.centrePrincipalId = centreId;
    }

    if (statut) {
      where.statut = statut;
    }

    if (search) {
      where.OR = [
        { prenom: { contains: search, mode: "insensitive" } },
        { nom: { contains: search, mode: "insensitive" } },
        { telephone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const familles = await prisma.famille.findMany({
      where,
      include: {
        centrePrincipal: true,
        _count: {
          select: {
            leadsRecommandes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map to include scoreFidelite and _count data
    const result = familles.map((famille) => ({
      ...famille,
      scoreFidelite: famille.scoreFidelite,
      _count: famille._count,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching familles:", error);
    return NextResponse.json(
      { error: "Failed to fetch familles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      prenom,
      nom,
      telephone,
      email,
      adresse,
      centrePrincipalId,
      sourceOrigine,
      commentaire,
    } = body;

    if (
      !prenom ||
      !nom ||
      !telephone ||
      !centrePrincipalId ||
      !sourceOrigine
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: prenom, nom, telephone, centrePrincipalId, sourceOrigine",
        },
        { status: 400 }
      );
    }

    const famille = await prisma.famille.create({
      data: {
        prenom,
        nom,
        telephone,
        email,
        adresse,
        centrePrincipalId,
        sourceOrigine,
        commentaire,
        statut: "actif",
      },
      include: {
        centrePrincipal: true,
      },
    });

    return NextResponse.json(famille, { status: 201 });
  } catch (error) {
    console.error("Error creating famille:", error);
    return NextResponse.json(
      { error: "Failed to create famille" },
      { status: 500 }
    );
  }
}
