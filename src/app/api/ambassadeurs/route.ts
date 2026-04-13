import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all familles with at least one leadsRecommandes
    const familles = await prisma.famille.findMany({
      include: {
        leadsRecommandes: {
          select: {
            id: true,
            statut: true,
          },
        },
      },
    });

    // Filter to only those with recommendations
    const ambassadeursData = familles
      .filter((f) => f.leadsRecommandes.length > 0)
      .map((f) => {
        const totalRecommandations = f.leadsRecommandes.length;
        const recommandationsConverties = f.leadsRecommandes.filter(
          (lead) => lead.statut === "converti"
        ).length;
        const tauxConversion =
          totalRecommandations > 0
            ? Math.round(
                (recommandationsConverties / totalRecommandations) * 10000
              ) / 100
            : 0;

        return {
          id: f.id,
          prenom: f.prenom,
          nom: f.nom,
          telephone: f.telephone,
          scoreFidelite: f.scoreFidelite,
          totalRecommandations,
          recommandationsConverties,
          tauxConversion,
        };
      })
      .sort((a, b) => b.totalRecommandations - a.totalRecommandations);

    // Calculate global stats
    const totalAmbassadeurs = ambassadeursData.length;
    const totalRecommandations = ambassadeursData.reduce(
      (acc, a) => acc + a.totalRecommandations,
      0
    );
    const totalConverties = ambassadeursData.reduce(
      (acc, a) => acc + a.recommandationsConverties,
      0
    );
    const tauxGlobal =
      totalRecommandations > 0
        ? Math.round((totalConverties / totalRecommandations) * 10000) / 100
        : 0;

    const result = {
      ambassadeurs: ambassadeursData,
      stats: {
        totalAmbassadeurs,
        totalRecommandations,
        totalConverties,
        tauxGlobal,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching ambassadeurs:", error);
    return NextResponse.json(
      { error: "Failed to fetch ambassadeurs" },
      { status: 500 }
    );
  }
}
