import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CRM SOS...");

  // Nettoyage
  await prisma.tache.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.inscription.deleteMany();
  await prisma.eleve.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campagne.deleteMany();
  await prisma.famille.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.centre.deleteMany();

  // --- CENTRES (2 centres + domicile) ---
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
      centreId: null, // Accès tous centres
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
  const campagneECR = await prisma.campagne.create({
    data: {
      nom: "Préparation ECR 8P",
      description: "Campagne de préparation pour l'examen de mi-parcours 8ème primaire",
      type: "ecr",
      dateDebut: new Date("2026-04-01"),
      dateFin: new Date("2026-06-15"),
      objectifLeads: 25,
      budget: 3000,
      statut: "active",
    },
  });

  const campagneRentree = await prisma.campagne.create({
    data: {
      nom: "Rentrée 2026",
      description: "Campagne de rentrée scolaire pour septembre 2026",
      type: "rentree",
      dateDebut: new Date("2026-09-01"),
      dateFin: new Date("2026-09-30"),
      objectifLeads: 40,
      budget: 5000,
      statut: "planifiee",
    },
  });

  const campagneStageEte = await prisma.campagne.create({
    data: {
      nom: "Stages été 2026",
      description: "Stages intensifs pendant l'été — au centre et à domicile",
      type: "stage_vacances",
      dateDebut: new Date("2026-07-01"),
      dateFin: new Date("2026-08-31"),
      objectifLeads: 30,
      budget: 4000,
      statut: "planifiee",
    },
  });

  // --- LEADS ---
  const lead1 = await prisma.lead.create({
    data: {
      prenomParent: "Catherine",
      nomParent: "Müller",
      telephone: "+41 79 123 45 67",
      email: "c.muller@gmail.com",
      source: "whatsapp",
      centreId: lausanne.id,
      statut: "nouveau",
      niveauScolaire: "8H",
      matiereDemandee: "Maths",
      offreDemandee: "CI",
      nombreEnfants: 1,
      scoreUrgence: 4,
      scoreBudget: 3,
      scoreReactivite: 4,
      scorePotentiel: 2,
      creeParId: sarah.id,
      campagneId: campagneECR.id,
      dateProchaineRelance: new Date(Date.now() + 86400000),
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      prenomParent: "Ahmed",
      nomParent: "Benali",
      telephone: "+41 78 234 56 78",
      email: null,
      source: "telephone",
      centreId: lausanne.id,
      statut: "contacte",
      niveauScolaire: "9VP",
      matiereDemandee: "Français, Allemand",
      offreDemandee: "ES",
      nombreEnfants: 2,
      scoreUrgence: 3,
      scoreBudget: 4,
      scoreReactivite: 3,
      scorePotentiel: 4,
      commentaire: "Demande cours à domicile pour ses deux enfants.",
      creeParId: sarah.id,
      campagneId: campagneECR.id,
      dateDernierContact: new Date(Date.now() - 172800000),
      dateProchaineRelance: new Date(Date.now() + 172800000),
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      prenomParent: "Marie",
      nomParent: "Rochat",
      telephone: "+41 77 345 67 89",
      email: "marie.rochat@bluewin.ch",
      source: "site_web",
      centreId: vevey.id,
      statut: "qualifie",
      niveauScolaire: "8H",
      matiereDemandee: "Maths, Sciences",
      offreDemandee: "CSP",
      nombreEnfants: 2,
      scoreUrgence: 5,
      scoreBudget: 4,
      scoreReactivite: 5,
      scorePotentiel: 5,
      commentaire: "Mère très engagée. Deux enfants en 8H et 6H. Cours au centre de Vevey.",
      creeParId: marc.id,
      dateDernierContact: new Date(Date.now() - 86400000),
      dateProchaineRelance: new Date(),
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      prenomParent: "Sophie",
      nomParent: "Favre",
      telephone: "+41 79 456 78 90",
      email: "s.favre@outlook.com",
      source: "instagram",
      centreId: lausanne.id,
      statut: "en_attente",
      niveauScolaire: "10VG",
      matiereDemandee: "Maths",
      offreDemandee: "CI",
      nombreEnfants: 1,
      scoreUrgence: 2,
      scoreBudget: 2,
      scoreReactivite: 2,
      scorePotentiel: 3,
      commentaire: "Intéressée mais doit discuter avec son conjoint. Préfère cours à domicile.",
      creeParId: ibrahim.id,
      dateProchaineRelance: new Date(Date.now() + 604800000),
    },
  });

  const lead5 = await prisma.lead.create({
    data: {
      prenomParent: "Pierre",
      nomParent: "Girard",
      telephone: "+41 78 567 89 01",
      email: null,
      source: "recommandation",
      centreId: vevey.id,
      statut: "perdu",
      niveauScolaire: "11VP",
      matiereDemandee: "Anglais",
      offreDemandee: "CI",
      nombreEnfants: 1,
      scoreUrgence: 0,
      scoreBudget: 0,
      scoreReactivite: 0,
      scorePotentiel: 0,
      raisonPerte: "trop_cher",
      commentaire: "A trouvé une solution moins chère auprès d'un étudiant privé.",
      creeParId: marc.id,
    },
  });

  const lead6 = await prisma.lead.create({
    data: {
      prenomParent: "Laura",
      nomParent: "Costa",
      telephone: "+41 79 678 90 12",
      email: "l.costa@gmail.com",
      source: "formulaire",
      centreId: lausanne.id,
      statut: "qualifie",
      niveauScolaire: "Gymnase 1ère",
      matiereDemandee: "Maths, Physique",
      offreDemandee: "SH",
      nombreEnfants: 1,
      scoreUrgence: 4,
      scoreBudget: 5,
      scoreReactivite: 4,
      scorePotentiel: 4,
      commentaire: "Veut débuter au centre de Lausanne avant la fin de l'année.",
      creeParId: sarah.id,
      campagneId: null,
      dateDernierContact: new Date(Date.now() - 432000000),
      dateProchaineRelance: new Date(Date.now() + 259200000),
    },
  });

  const lead7 = await prisma.lead.create({
    data: {
      prenomParent: "Yves",
      nomParent: "Favre",
      telephone: "+41 77 789 01 23",
      email: "y.favre@pro.ch",
      source: "bouche_a_oreille",
      centreId: vevey.id,
      statut: "nouveau",
      niveauScolaire: "6H",
      matiereDemandee: "Français, Maths",
      offreDemandee: "ES",
      nombreEnfants: 1,
      scoreUrgence: 3,
      scoreBudget: 3,
      scoreReactivite: 3,
      scorePotentiel: 3,
      commentaire: "Recommandé par un ancien client. Veut cours à domicile.",
      creeParId: ibrahim.id,
      dateProchaineRelance: new Date(Date.now() + 172800000),
    },
  });

  const lead8 = await prisma.lead.create({
    data: {
      prenomParent: "Nathalie",
      nomParent: "Bernard",
      telephone: "+41 78 890 12 34",
      email: null,
      source: "precommande",
      centreId: vevey.id,
      statut: "contacte",
      niveauScolaire: "9VP",
      matiereDemandee: "Allemand",
      offreDemandee: "SI",
      nombreEnfants: 1,
      scoreUrgence: 2,
      scoreBudget: 3,
      scoreReactivite: 3,
      scorePotentiel: 2,
      commentaire: "Pré-inscription pour stage intensif estival au centre de Vevey.",
      creeParId: marc.id,
      campagneId: campagneStageEte.id,
      dateDernierContact: new Date(Date.now() - 259200000),
      dateProchaineRelance: new Date(Date.now() + 345600000),
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
      commentaire: "Cliente fidèle depuis 3 ans. Deux enfants. Cours au centre de Lausanne.",
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
      commentaire: "Client recommandé. Cours au centre de Vevey depuis 2 ans.",
    },
  });

  const famille3 = await prisma.famille.create({
    data: {
      prenom: "Françoise",
      nom: "Lévy",
      telephone: "+41 77 333 44 55",
      email: "f.levy@bluewin.ch",
      adresse: "Chemin du Bois 7, 1012 Lausanne",
      centrePrincipalId: lausanne.id,
      statut: "actif",
      sourceOrigine: "site_web",
      scoreFidelite: 5,
      commentaire: "Ancien client réactivé. Cours à domicile. Très satisfait.",
    },
  });

  const famille4 = await prisma.famille.create({
    data: {
      prenom: "Jérôme",
      nom: "Monnet",
      telephone: "+41 79 444 55 66",
      email: "j.monnet@gmail.com",
      adresse: "Rue du Marché 15, 1800 Vevey",
      centrePrincipalId: vevey.id,
      statut: "actif",
      sourceOrigine: "formulaire",
      scoreFidelite: 2,
      commentaire: "Nouveau client. Cours à domicile et au centre de Vevey.",
    },
  });

  // --- ÉLÈVES ---
  const eleve1 = await prisma.eleve.create({
    data: {
      prenom: "Lucas",
      nom: "Dubois",
      familleId: famille1.id,
      niveauScolaire: "10VP",
      ecole: "Établissement de Béthusy",
      centreId: lausanne.id,
      statut: "actif",
    },
  });

  const eleve2 = await prisma.eleve.create({
    data: {
      prenom: "Emma",
      nom: "Dubois",
      familleId: famille1.id,
      niveauScolaire: "8H",
      ecole: "Établissement de Béthusy",
      centreId: lausanne.id,
      statut: "actif",
    },
  });

  const eleve3 = await prisma.eleve.create({
    data: {
      prenom: "Mateo",
      nom: "Silva",
      familleId: famille2.id,
      niveauScolaire: "9VP",
      ecole: "Collège du Léman",
      centreId: vevey.id,
      statut: "actif",
    },
  });

  const eleve4 = await prisma.eleve.create({
    data: {
      prenom: "Léa",
      nom: "Silva",
      familleId: famille2.id,
      niveauScolaire: "6H",
      ecole: "École Jules-Hegnauer",
      centreId: vevey.id,
      statut: "actif",
    },
  });

  const eleve5 = await prisma.eleve.create({
    data: {
      prenom: "Théo",
      nom: "Lévy",
      familleId: famille3.id,
      niveauScolaire: "Gymnase 2ème",
      ecole: "Gymnase de Burier",
      centreId: lausanne.id,
      statut: "actif",
    },
  });

  const eleve6 = await prisma.eleve.create({
    data: {
      prenom: "Clara",
      nom: "Monnet",
      familleId: famille4.id,
      niveauScolaire: "9VG",
      ecole: "Collège de Vevey",
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

  await prisma.inscription.create({
    data: {
      eleveId: eleve2.id,
      typeOffre: "ES",
      formule: "Abo mensuel 2x/semaine",
      matieres: "Toutes matières",
      centreId: lausanne.id,
      statut: "en_cours",
      dateDebut: new Date("2026-02-01"),
    },
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleve3.id,
      typeOffre: "CSP",
      formule: "Cours semi-privé",
      matieres: "Maths, Français",
      centreId: vevey.id,
      statut: "en_cours",
      dateDebut: new Date("2025-09-01"),
    },
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleve4.id,
      typeOffre: "ES",
      formule: "Suivi hebdomadaire",
      matieres: "Français, Maths",
      centreId: vevey.id,
      statut: "en_cours",
      dateDebut: new Date("2026-03-01"),
    },
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleve1.id,
      typeOffre: "SI",
      formule: "Stage Pâques Maths",
      matieres: "Maths",
      centreId: lausanne.id,
      statut: "termine",
      dateDebut: new Date("2026-04-06"),
      dateFin: new Date("2026-04-10"),
    },
  });

  await prisma.inscription.create({
    data: {
      eleveId: eleve5.id,
      typeOffre: "SH",
      formule: "Sessions hebdo 3h",
      matieres: "Maths, Allemand",
      centreId: lausanne.id,
      statut: "en_cours",
      dateDebut: new Date("2026-02-15"),
    },
  });

  // --- INTERACTIONS ---
  await prisma.interaction.create({
    data: {
      type: "whatsapp",
      date: new Date(Date.now() - 86400000),
      resume: "Premier contact. Mme Müller demande des infos sur les cours privés de maths pour son fils en 8H.",
      prochaineAction: "Envoyer tarifs et disponibilités",
      leadId: lead1.id,
      creeParId: sarah.id,
    },
  });

  await prisma.interaction.create({
    data: {
      type: "appel",
      date: new Date(Date.now() - 259200000),
      resume: "Appel avec M. Benali. Besoin de cours à domicile pour ses deux enfants.",
      prochaineAction: "Envoyer détails des horaires et tarifs",
      leadId: lead2.id,
      creeParId: sarah.id,
    },
  });

  await prisma.interaction.create({
    data: {
      type: "appel",
      date: new Date(Date.now() - 604800000),
      resume: "Mme Dubois satisfaite du stage de Pâques. Lucas a bien progressé.",
      prochaineAction: "Proposer renouvellement pack 20h",
      familleId: famille1.id,
      creeParId: ibrahim.id,
    },
  });

  await prisma.interaction.create({
    data: {
      type: "note_interne",
      date: new Date(Date.now() - 172800000),
      resume: "Mme Rochat hésite entre cours semi-privé et étude surveillée au centre de Vevey.",
      prochaineAction: "Rappeler lundi pour finaliser l'inscription",
      leadId: lead3.id,
      creeParId: marc.id,
    },
  });

  await prisma.interaction.create({
    data: {
      type: "email",
      date: new Date(Date.now() - 345600000),
      resume: "Envoi devis pour Mme Favre — cours individuels à domicile.",
      prochaineAction: "Relancer si pas de réponse dans 3 jours",
      leadId: lead4.id,
      creeParId: ibrahim.id,
    },
  });

  await prisma.interaction.create({
    data: {
      type: "rdv",
      date: new Date(Date.now() - 432000000),
      resume: "Visite centre Lausanne avec Mme Costa. Elle veut débuter sessions hebdo en mai.",
      prochaineAction: "Envoyer planning prévisionnel",
      leadId: lead6.id,
      creeParId: sarah.id,
    },
  });

  await prisma.interaction.create({
    data: {
      type: "whatsapp",
      date: new Date(Date.now() - 518400000),
      resume: "M. Monnet satisfait des progrès de Clara au centre de Vevey.",
      prochaineAction: "Proposer forfait été",
      familleId: famille4.id,
      creeParId: ibrahim.id,
    },
  });

  // --- TÂCHES ---
  await prisma.tache.create({
    data: {
      titre: "Rappeler Mme Müller",
      description: "Premier contact WhatsApp il y a un jour. Rappeler pour qualifier le besoin.",
      type: "relance_prospect",
      dateEcheance: new Date(Date.now() + 86400000),
      statut: "a_faire",
      priorite: "urgente",
      assigneeId: sarah.id,
      leadId: lead1.id,
      creeParId: sarah.id,
    },
  });

  await prisma.tache.create({
    data: {
      titre: "Envoyer horaires à M. Benali",
      description: "Lui transmettre les créneaux disponibles pour cours à domicile.",
      type: "relance_prospect",
      dateEcheance: new Date(),
      statut: "a_faire",
      priorite: "urgente",
      assigneeId: sarah.id,
      leadId: lead2.id,
      creeParId: sarah.id,
    },
  });

  await prisma.tache.create({
    data: {
      titre: "Finaliser inscription Mme Rochat",
      description: "Elle hésite entre cours semi-privé et étude surveillée. Rappeler pour conclure.",
      type: "relance_prospect",
      dateEcheance: new Date(),
      statut: "a_faire",
      priorite: "urgente",
      assigneeId: marc.id,
      leadId: lead3.id,
      creeParId: marc.id,
    },
  });

  await prisma.tache.create({
    data: {
      titre: "Proposer renouvellement pack à Mme Dubois",
      description: "Pack 20h de Lucas bientôt épuisé. Proposer renouvellement.",
      type: "relance_reinscription",
      dateEcheance: new Date(Date.now() + 259200000),
      statut: "a_faire",
      priorite: "normale",
      assigneeId: ibrahim.id,
      familleId: famille1.id,
      creeParId: ibrahim.id,
    },
  });

  await prisma.tache.create({
    data: {
      titre: "Confirmation stage Mme Bernard",
      description: "Pré-inscription pour stage intensif estival au centre de Vevey.",
      type: "relance_prospect",
      dateEcheance: new Date(Date.now() + 345600000),
      statut: "a_faire",
      priorite: "normale",
      assigneeId: marc.id,
      leadId: lead8.id,
      creeParId: marc.id,
    },
  });

  await prisma.tache.create({
    data: {
      titre: "Réactivation campagne rentrée",
      description: "Préparer matériel marketing pour la campagne Rentrée 2026.",
      type: "suivi",
      dateEcheance: new Date(Date.now() + 4320000000),
      statut: "a_faire",
      priorite: "normale",
      assigneeId: ibrahim.id,
      creeParId: ibrahim.id,
    },
  });

  console.log("✅ Seed terminé !");
  console.log(`   2 centres (Lausanne + Vevey)`);
  console.log(`   3 utilisateurs`);
  console.log(`   3 campagnes`);
  console.log(`   8 leads`);
  console.log(`   4 familles`);
  console.log(`   6 élèves`);
  console.log(`   6 inscriptions`);
  console.log(`   7 interactions`);
  console.log(`   6 tâches`);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
