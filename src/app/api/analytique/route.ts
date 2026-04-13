import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Conversion par source
    const sourceStats = await prisma.lead.groupBy({
      by: ["source"],
      _count: true,
    });

    const conversionParSource = await Promise.all(
      sourceStats.map(async (stat) => {
        const convertedCount = await prisma.lead.count({
          where: {
            source: stat.source,
            statut: "converti",
          },
        });
        const rate = stat._count > 0 ? (convertedCount / stat._count) * 100 : 0;
        return {
          source: stat.source,
          totalLeads: stat._count,
          convertedLeads: convertedCount,
          conversionRate: Math.round(rate * 100) / 100,
        };
      })
    );

    // Raisons de perte
    const lostLeads = await prisma.lead.findMany({
      where: {
        statut: "perdu",
      },
      select: {
        raisonPerte: true,
      },
    });

    const raisonsDePerte: Record<string, number> = {};
    lostLeads.forEach((lead) => {
      const raison = lead.raisonPerte || "non_specifie";
      raisonsDePerte[raison] = (raisonsDePerte[raison] || 0) + 1;
    });

    const raisonsData = Object.entries(raisonsDePerte).map(([raison, count]) => ({
      raison,
      count,
    }));

    // Top offres demandées
    const offerStats = await prisma.lead.groupBy({
      by: ["offreDemandee"],
      _count: true,
    });

    const topOffres = offerStats
      .map((stat) => ({
        offre: stat.offreDemandee || "non_precise",
        count: stat._count,
      }))
      .sort((a, b) => b.count - a.count);

    // Performance par centre
    const centres = await prisma.centre.findMany({
      select: { id: true, nom: true, code: true },
    });

    const performanceParCentre = await Promise.all(
      centres.map(async (centre) => {
        const totalLeads = await prisma.lead.count({
          where: { centreId: centre.id },
        });
        const convertedLeads = await prisma.lead.count({
          where: {
            centreId: centre.id,
            statut: "converti",
          },
        });
        const activeFamilies = await prisma.famille.count({
          where: {
            centrePrincipalId: centre.id,
            statut: "actif",
          },
        });

        return {
          centreCode: centre.code,
          centreName: centre.nom,
          totalLeads,
          convertedLeads,
          activeFamilies,
        };
      })
    );

    // Délai moyen de conversion
    const convertedLeads = await prisma.lead.findMany({
      where: { statut: "converti" },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let delaiMoyenConversion = 0;
    if (convertedLeads.length > 0) {
      const totalDays = convertedLeads.reduce((acc, lead) => {
        const days = Math.floor(
          (lead.updatedAt.getTime() - lead.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return acc + days;
      }, 0);
      delaiMoyenConversion = Math.round(totalDays / convertedLeads.length);
    }

    // Evolution mensuelle (derniers 6 mois)
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allLeads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const evolutionMensuelleMap: Record<string, number> = {};
    allLeads.forEach((lead) => {
      const month = lead.createdAt.toISOString().slice(0, 7); // YYYY-MM
      evolutionMensuelleMap[month] = (evolutionMensuelleMap[month] || 0) + 1;
    });

    const evolutionMensuelle = Object.entries(evolutionMensuelleMap)
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const analytics = {
      conversionParSource,
      raisonsDePerte: raisonsData,
      topOffres,
      performanceParCentre,
      delaiMoyenConversion,
      evolutionMensuelle,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
