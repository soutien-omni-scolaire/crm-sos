import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getPeriodDates(period: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (period) {
    case "today":
      return { start: today, end: tomorrow };
    case "week": {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const nextMonday = new Date(monday);
      nextMonday.setDate(monday.getDate() + 7);
      return { start: monday, end: nextMonday };
    }
    case "year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
      return { start: startOfYear, end: endOfYear };
    }
    case "month":
    default: {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start: startOfMonth, end: endOfMonth };
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const { start, end } = getPeriodDates(period);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Leads en cours (not converti or perdu) - global count
    const leadsEnCours = await prisma.lead.count({
      where: {
        statut: {
          notIn: ["converti", "perdu"],
        },
      },
    });

    // Relances en retard (taches with dateEcheance < today and statut = a_faire)
    const relancesEnRetard = await prisma.tache.count({
      where: {
        dateEcheance: {
          lt: today,
        },
        statut: "a_faire",
      },
    });

    // Convertis dans la periode
    const convertisPeriode = await prisma.lead.count({
      where: {
        statut: "converti",
        updatedAt: {
          gte: start,
          lt: end,
        },
      },
    });

    // Familles actives - global count
    const famillesActives = await prisma.famille.count({
      where: {
        statut: "actif",
      },
    });

    // Familles inactives
    const famillesInactives = await prisma.famille.count({
      where: {
        statut: "inactif",
      },
    });

    // Taux de conversion
    const totalLeads = await prisma.lead.count();
    const convertedLeads = await prisma.lead.count({
      where: {
        statut: "converti",
      },
    });
    const tauxConversion =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Revenue estime
    const activeInscriptions = await prisma.inscription.count({
      where: {
        statut: "en_cours",
      },
    });
    const revenueEstime = activeInscriptions * 150;

    // Entonnoir de conversion
    const entonnoir = {
      nouveau: await prisma.lead.count({ where: { statut: "nouveau" } }),
      contacte: await prisma.lead.count({ where: { statut: "contacte" } }),
      qualifie: await prisma.lead.count({ where: { statut: "qualifie" } }),
      en_attente: await prisma.lead.count({ where: { statut: "en_attente" } }),
      converti: convertedLeads,
      perdu: await prisma.lead.count({ where: { statut: "perdu" } }),
    };

    // Leads by source
    const leadsBySource = await prisma.lead.groupBy({
      by: ["source"],
      _count: true,
    });

    const leadsBySourceData = leadsBySource.map((item) => ({
      source: item.source,
      count: item._count,
    }));

    // Taches du jour (due today or overdue, a_faire)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tachesAujourdhui = await prisma.tache.findMany({
      where: {
        dateEcheance: {
          lt: tomorrow,
        },
        statut: "a_faire",
      },
      orderBy: {
        dateEcheance: "asc",
      },
      take: 10,
    });

    // Derniers leads (last 5)
    const derniersLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        centre: {
          select: {
            id: true,
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
    });

    // Raisons de perte
    const raisonsPerteData = await prisma.lead.groupBy({
      by: ["raisonPerte"],
      where: {
        statut: "perdu",
        raisonPerte: { not: null },
      },
      _count: true,
    });

    const raisonsDePerteData = raisonsPerteData.map((item) => ({
      raison: item.raisonPerte || "non_precise",
      count: item._count,
    }));

    const dashboard = {
      leadsEnCours,
      relancesEnRetard,
      convertisCeMois: convertisPeriode,
      famillesActives,
      famillesInactives,
      tauxConversion: Math.round(tauxConversion * 100) / 100,
      revenueEstime,
      entonnoir,
      leadsBySource: leadsBySourceData,
      leadsByStatut: [],
      raisonsDePerteData,
      tachesAujourdhui,
      derniersLeads,
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
