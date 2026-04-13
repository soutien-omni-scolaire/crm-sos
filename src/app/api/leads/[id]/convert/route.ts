import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface InscriptionData {
  typeOffre: string;
  formule?: string;
  matieres?: string;
  dateDebut: string;
}

interface EleveData {
  prenom: string;
  nom: string;
  niveauScolaire?: string;
  ecole?: string;
  inscriptions: InscriptionData[];
}

interface ConvertBody {
  nomParent: string;
  eleves: EleveData[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ConvertBody = await request.json();

    const { nomParent, eleves } = body;

    if (!nomParent || !eleves || eleves.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: nomParent, eleves" },
        { status: 400 }
      );
    }

    // Fetch the lead
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Use transaction to create famille, eleves, and inscriptions
    const result = await prisma.$transaction(async (tx) => {
      // Create Famille
      const famille = await tx.famille.create({
        data: {
          prenom: lead.prenomParent,
          nom: nomParent,
          telephone: lead.telephone,
          email: lead.email,
          centrePrincipalId: lead.centreId,
          sourceOrigine: lead.source,
          commentaire: lead.commentaire,
          statut: "actif",
        },
      });

      // Create Eleves and Inscriptions
      const elevesWithInscriptions = await Promise.all(
        eleves.map(async (eleve) => {
          const createdEleve = await tx.eleve.create({
            data: {
              prenom: eleve.prenom,
              nom: eleve.nom,
              familleId: famille.id,
              niveauScolaire: eleve.niveauScolaire,
              ecole: eleve.ecole,
              centreId: lead.centreId,
              statut: "actif",
            },
          });

          const createdInscriptions = await Promise.all(
            eleve.inscriptions.map((inscription) => {
              // Validate that typeOffre is one of the allowed values: CI, ES, CSP, SH, SI
              const validOffers = ["CI", "ES", "CSP", "SH", "SI"];
              const typeOffre = inscription.typeOffre && validOffers.includes(inscription.typeOffre)
                ? inscription.typeOffre
                : "CI";

              return tx.inscription.create({
                data: {
                  eleveId: createdEleve.id,
                  typeOffre,
                  formule: inscription.formule,
                  matieres: inscription.matieres,
                  centreId: lead.centreId,
                  dateDebut: new Date(inscription.dateDebut),
                  statut: "en_cours",
                },
              });
            })
          );

          return {
            ...createdEleve,
            inscriptions: createdInscriptions,
          };
        })
      );

      // Update Lead
      const updatedLead = await tx.lead.update({
        where: { id: params.id },
        data: {
          statut: "converti",
          familleId: famille.id,
        },
      });

      return {
        lead: updatedLead,
        famille,
        eleves: elevesWithInscriptions,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error converting lead:", error);
    return NextResponse.json(
      { error: "Failed to convert lead" },
      { status: 500 }
    );
  }
}
