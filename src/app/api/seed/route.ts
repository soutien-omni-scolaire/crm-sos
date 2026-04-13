import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Security: require seed password
    const { password } = await request.json();
    const seedPassword = process.env.CRM_PASSWORD || "SOS2024!";

    if (password !== seedPassword) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Check if centres already exist
    const existingCentres = await prisma.centre.count();
    if (existingCentres > 0) {
      return NextResponse.json({
        message: "La base de donnees contient deja des donnees. Seed ignore.",
        centres: existingCentres,
      });
    }

    // --- CENTRES ---
    const lausanne = await prisma.centre.create({
      data: {
        nom: "Lausanne",
        code: "LAU",
        adresse: "Lausanne, Suisse",
        telephone: "+41 21 555 11 01",
      },
    });

    const vevey = await prisma.centre.create({
      data: {
        nom: "Vevey",
        code: "VEV",
        adresse: "Vevey, Suisse",
        telephone: "+41 21 922 00 01",
      },
    });

    // --- UTILISATEURS ---
    const ibrahim = await prisma.utilisateur.create({
      data: {
        prenom: "Ibrahim",
        nom: "Camara",
        email: "contact@soutien-omni-scolaire.ch",
        password: "$2b$10$placeholder_hash_admin123",
        role: "admin",
        centreId: null,
      },
    });

    const sarah = await prisma.utilisateur.create({
      data: {
        prenom: "Sarah",
        nom: "Dubois",
        email: "sarah@soutien-omni-scolaire.ch",
        password: "$2b$10$placeholder_hash_admin123",
        role: "responsable",
        centreId: lausanne.id,
      },
    });

    const marc = await prisma.utilisateur.create({
      data: {
        prenom: "Marc",
        nom: "Keller",
        email: "marc@soutien-omni-scolaire.ch",
        password: "$2b$10$placeholder_hash_admin123",
        role: "assistant",
        centreId: vevey.id,
      },
    });

    // --- CAMPAGNES ---
    await prisma.campagne.create({
      data: {
        nom: "Preparation ECR 8P",
        description: "Campagne de preparation pour l'examen de mi-parcours 8eme primaire",
        type: "ecr",
        dateDebut: new Date("2026-04-01"),
        dateFin: new Date("2026-06-15"),
        objectifLeads: 25,
        budget: 3000,
        statut: "active",
      },
    });

    await prisma.campagne.create({
      data: {
        nom: "Rentree 2026",
        description: "Campagne de rentree scolaire pour septembre 2026",
        type: "rentree",
        dateDebut: new Date("2026-09-01"),
        dateFin: new Date("2026-09-30"),
        objectifLeads: 40,
        budget: 5000,
        statut: "planifiee",
      },
    });

    await prisma.campagne.create({
      data: {
        nom: "Stages ete 2026",
        description: "Stages intensifs pendant ete",
        type: "stage_vacances",
        dateDebut: new Date("2026-07-01"),
        dateFin: new Date("2026-08-31"),
        objectifLeads: 30,
        budget: 4000,
        statut: "planifiee",
      },
    });

    // --- SAMPLE LEADS ---
    await prisma.lead.create({
      data: {
        prenomParent: "Catherine",
        nomParent: "Muller",
        telephone: "+41 79 123 45 67",
        email: "c.muller@gmail.com",
        source: "whatsapp",
        centreId: lausanne.id,
        statut: "nouveau",
        niveauScolaire: "8P",
        matiereDemandee: "Maths",
        offreDemandee: "CI",
        nombreEnfants: 1,
        scoreUrgence: 4,
        scoreBudget: 3,
        scoreReactivite: 4,
        scorePotentiel: 2,
        creeParId: sarah.id,
        dateProchaineRelance: new Date(Date.now() + 86400000),
      },
    });

    await prisma.lead.create({
      data: {
        prenomParent: "Ahmed",
        nomParent: "Benali",
        telephone: "+41 78 234 56 78",
        source: "telephone",
        centreId: lausanne.id,
        statut: "contacte",
        niveauScolaire: "9S",
        matiereDemandee: "Francais, Allemand",
        offreDemandee: "ES",
        nombreEnfants: 2,
        scoreUrgence: 3,
        scoreBudget: 4,
        scoreReactivite: 3,
        scorePotentiel: 4,
        creeParId: sarah.id,
        dateProchaineRelance: new Date(Date.now() + 172800000),
      },
    });

    await prisma.lead.create({
      data: {
        prenomParent: "Marie",
        nomParent: "Rochat",
        telephone: "+41 77 345 67 89",
        email: "marie.rochat@bluewin.ch",
        source: "site_web",
        centreId: vevey.id,
        statut: "qualifie",
        niveauScolaire: "8P",
        matiereDemandee: "Maths, Sciences",
        offreDemandee: "CSP",
        nombreEnfants: 2,
        scoreUrgence: 5,
        scoreBudget: 4,
        scoreReactivite: 5,
        scorePotentiel: 5,
        creeParId: marc.id,
        dateProchaineRelance: new Date(),
      },
    });

    await prisma.lead.create({
      data: {
        prenomParent: "Laura",
        nomParent: "Costa",
        telephone: "+41 79 678 90 12",
        email: "l.costa@gmail.com",
        source: "formulaire",
        centreId: lausanne.id,
        statut: "qualifie",
        niveauScolaire: "1re Gymnase",
        matiereDemandee: "Maths, Physique",
        offreDemandee: "SH",
        nombreEnfants: 1,
        scoreUrgence: 4,
        scoreBudget: 5,
        scoreReactivite: 4,
        scorePotentiel: 4,
        creeParId: sarah.id,
        dateProchaineRelance: new Date(Date.now() + 259200000),
      },
    });

    // --- FAMILLES ---
    const famille1 = await prisma.famille.create({
      data: {
        prenom: "Nathalie",
        nom: "Dubois",
        telephone: "+41 79 111 22 33",
        email: "n.dubois@gmail.com",
        adresse: "Rue de la Paix 10, 1003 Lausanne",
        centrePrincipalId: lausanne.id,
        statut: "actif",
        sourceOrigine: "whatsapp",
        scoreFidelite: 4,
      },
    });

    const famille2 = await prisma.famille.create({
      data: {
        prenom: "Roberto",
        nom: "Silva",
        telephone: "+41 78 222 33 44",
        email: "r.silva@outlook.com",
        adresse: "Avenue des Alpes 5, 1800 Vevey",
        centrePrincipalId: vevey.id,
        statut: "actif",
        sourceOrigine: "recommandation",
        scoreFidelite: 3,
      },
    });

    // --- ELEVES ---
    const eleve1 = await prisma.eleve.create({
      data: {
        prenom: "Lucas",
        nom: "Dubois",
        familleId: famille1.id,
        niveauScolaire: "10S",
        ecole: "Etablissement de Bethusy",
        centreId: lausanne.id,
        statut: "actif",
      },
    });

    await prisma.eleve.create({
      data: {
        prenom: "Emma",
        nom: "Dubois",
        familleId: famille1.id,
        niveauScolaire: "8P",
        ecole: "Etablissement de Bethusy",
        centreId: lausanne.id,
        statut: "actif",
      },
    });

    await prisma.eleve.create({
      data: {
        prenom: "Mateo",
        nom: "Silva",
        familleId: famille2.id,
        niveauScolaire: "9S",
        ecole: "College du Leman",
        centreId: vevey.id,
        statut: "actif",
      },
    });

    // --- INSCRIPTIONS ---
    await prisma.inscription.create({
      data: {
        eleveId: eleve1.id,
        typeOffre: "CI",
        formule: "Pack 20h",
        matieres: "Maths, Physique",
        centreId: lausanne.id,
        statut: "en_cours",
        dateDebut: new Date("2026-01-15"),
      },
    });

    // --- TACHES ---
    await prisma.tache.create({
      data: {
        titre: "Rappeler Mme Muller",
        description: "Premier contact WhatsApp. Rappeler pour qualifier le besoin.",
        type: "relance_prospect",
        dateEcheance: new Date(Date.now() + 86400000),
        statut: "a_faire",
        priorite: "urgente",
        assigneeId: sarah.id,
        creeParId: sarah.id,
      },
    });

    await prisma.tache.create({
      data: {
        titre: "Finaliser inscription Mme Rochat",
        description: "Elle hesite entre cours semi-prive et etude surveillee.",
        type: "relance_prospect",
        dateEcheance: new Date(),
        statut: "a_faire",
        priorite: "urgente",
        assigneeId: marc.id,
        creeParId: marc.id,
      },
    });

    await prisma.tache.create({
      data: {
        titre: "Proposer renouvellement pack a Mme Dubois",
        description: "Pack 20h de Lucas bientot epuise.",
        type: "relance_reinscription",
        dateEcheance: new Date(Date.now() + 259200000),
        statut: "a_faire",
        priorite: "normale",
        assigneeId: ibrahim.id,
        familleId: famille1.id,
        creeParId: ibrahim.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Base de donnees initialisee avec succes",
      data: {
        centres: 2,
        utilisateurs: 3,
        campagnes: 3,
        leads: 4,
        familles: 2,
        eleves: 3,
        inscriptions: 1,
        taches: 3,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation", details: String(error) },
      { status: 500 }
    );
  }
}
