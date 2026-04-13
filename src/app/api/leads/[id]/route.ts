import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        centre: true,
        creePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        campagne: true,
        recommandePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            telephone: true,
          },
        },
        interactions: {
          include: {
            creePar: {
              select: {
                id: true,
                prenom: true,
                nom: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        taches: {
          include: {
            assignee: {
              select: {
                id: true,
                prenom: true,
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
          orderBy: {
            dateEcheance: "asc",
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
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

    const {
      prenomParent,
      nomParent,
      telephone,
      email,
      source,
      statut,
      niveauScolaire,
      matiereDemandee,
      offreDemandee,
      nombreEnfants,
      scoreUrgence,
      scoreBudget,
      scoreReactivite,
      scorePotentiel,
      campagneId,
      recommandeParId,
      raisonPerte,
      commentaire,
      dateDernierContact,
      dateProchaineRelance,
    } = body;

    const dataToUpdate: any = {};

    if (prenomParent !== undefined) dataToUpdate.prenomParent = prenomParent;
    if (nomParent !== undefined) dataToUpdate.nomParent = nomParent;
    if (telephone !== undefined) dataToUpdate.telephone = telephone;
    if (email !== undefined) dataToUpdate.email = email;
    if (source !== undefined) dataToUpdate.source = source;
    if (statut !== undefined) dataToUpdate.statut = statut;
    if (niveauScolaire !== undefined) dataToUpdate.niveauScolaire = niveauScolaire;
    if (matiereDemandee !== undefined) dataToUpdate.matiereDemandee = matiereDemandee;
    if (offreDemandee !== undefined) dataToUpdate.offreDemandee = offreDemandee;
    if (nombreEnfants !== undefined) dataToUpdate.nombreEnfants = nombreEnfants;
    if (scoreUrgence !== undefined) dataToUpdate.scoreUrgence = scoreUrgence;
    if (scoreBudget !== undefined) dataToUpdate.scoreBudget = scoreBudget;
    if (scoreReactivite !== undefined) dataToUpdate.scoreReactivite = scoreReactivite;
    if (scorePotentiel !== undefined) dataToUpdate.scorePotentiel = scorePotentiel;
    if (campagneId !== undefined) dataToUpdate.campagneId = campagneId;
    if (recommandeParId !== undefined) dataToUpdate.recommandeParId = recommandeParId;
    if (raisonPerte !== undefined) dataToUpdate.raisonPerte = raisonPerte;
    if (commentaire !== undefined) dataToUpdate.commentaire = commentaire;
    if (dateDernierContact !== undefined) dataToUpdate.dateDernierContact = dateDernierContact;
    if (dateProchaineRelance !== undefined) dataToUpdate.dateProchaineRelance = dateProchaineRelance;

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        centre: true,
        creePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
          },
        },
        campagne: true,
        recommandePar: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            telephone: true,
          },
        },
        interactions: {
          include: {
            creePar: {
              select: {
                id: true,
                prenom: true,
                nom: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        taches: {
          include: {
            assignee: {
              select: {
                id: true,
                prenom: true,
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
          orderBy: {
            dateEcheance: "asc",
          },
        },
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
