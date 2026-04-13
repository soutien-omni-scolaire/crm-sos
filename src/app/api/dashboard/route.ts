import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Leads en cours (not converti or perdu)
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

    // Convertis ce mois
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const convertisThisMonth = await prisma.lead.count({
      where: {
        statut: "converti",
        updatedAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Familles actives
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

    // Revenue estimé
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

    // Taches aujourd'hui (due today or overdue, a_faire)
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

    const dashboard = {
      leadsEnCours,
      relancesEnRetard,
      convertisCeMois: convertisThisMonth,
      famillesActives,
      famillesInactives,
      tauxConversion: Math.round(tauxConversion * 100) / 100,
      revenueEstime,
      entonnoir,
      leadsBySource: leadsBySourceData,
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
