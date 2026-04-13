// Types dérivés de Prisma avec relations incluses
// Ces types sont utilisés côté frontend

export interface Centre {
  id: string;
  nom: string;
  code: string;
  adresse: string | null;
  telephone: string | null;
  actif: boolean;
}

export interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  centreId: string | null;
  actif: boolean;
  centre?: Centre | null;
}

export interface Lead {
  id: string;
  prenomParent: string;
  nomParent: string | null;
  telephone: string;
  email: string | null;
  source: string;
  centreId: string;
  statut: string;
  niveauScolaire: string | null;
  matiereDemandee: string | null;
  offreDemandee: string | null;
  nombreEnfants: number;
  scoreUrgence: number;
  scoreBudget: number;
  scoreReactivite: number;
  scorePotentiel: number;
  commentaire: string | null;
  raisonPerte: string | null;
  dateDernierContact: string | null;
  dateProchaineRelance: string | null;
  campagneId: string | null;
  recommandeParId: string | null;
  creeParId: string;
  familleId: string | null;
  createdAt: string;
  updatedAt: string;
  centre?: Centre;
  creePar?: Utilisateur;
  famille?: Famille | null;
  campagne?: Campagne | null;
  recommandePar?: Famille | null;
  interactions?: Interaction[];
  taches?: Tache[];
}

export interface Famille {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  centrePrincipalId: string;
  statut: string;
  sourceOrigine: string;
  scoreFidelite: number;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  centrePrincipal?: Centre;
  eleves?: Eleve[];
  lead?: Lead | null;
  leadsRecommandes?: Lead[];
  interactions?: Interaction[];
  taches?: Tache[];
}

export interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  familleId: string;
  niveauScolaire: string | null;
  ecole: string | null;
  centreId: string;
  statut: string;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  famille?: Famille;
  centre?: Centre;
  inscriptions?: Inscription[];
}

export interface Inscription {
  id: string;
  eleveId: string;
  typeOffre: string;
  formule: string | null;
  matieres: string | null;
  centreId: string;
  statut: string;
  dateDebut: string;
  dateFin: string | null;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  eleve?: Eleve;
  centre?: Centre;
}

export interface Interaction {
  id: string;
  type: string;
  date: string;
  resume: string;
  prochaineAction: string | null;
  leadId: string | null;
  familleId: string | null;
  creeParId: string;
  createdAt: string;
  creePar?: Utilisateur;
  lead?: Lead | null;
  famille?: Famille | null;
}

export interface Tache {
  id: string;
  titre: string;
  description: string | null;
  type: string;
  dateEcheance: string;
  statut: string;
  priorite: string;
  assigneeId: string;
  leadId: string | null;
  familleId: string | null;
  creeParId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: Utilisateur;
  creePar?: Utilisateur;
  lead?: Lead | null;
  famille?: Famille | null;
}

export interface Campagne {
  id: string;
  nom: string;
  description: string | null;
  type: string;
  dateDebut: string;
  dateFin: string;
  objectifLeads: number;
  budget: number | null;
  statut: string;
  createdAt: string;
  updatedAt: string;
  leads?: Lead[];
}

export interface DashboardStats {
  leadsEnCours: number;
  relancesEnRetard: number;
  convertisCeMois: number;
  famillesActives: number;
  famillesInactives: number;
  tauxConversion: number;
  revenueEstime: number;
  leadsBySource: { source: string; count: number }[];
  leadsByStatut: { statut: string; count: number }[];
  raisonsDePerteData: { raison: string; count: number }[];
  entonnoir: {
    nouveau: number;
    contacte: number;
    qualifie: number;
    en_attente: number;
    converti: number;
    perdu: number;
  };
  tachesAujourdhui: Tache[];
  derniersLeads: Lead[];
}

export interface AnalyticsData {
  totalLeads: number;
  tauxConversionGlobal: number;
  scoresMoyens: {
    urgence: number;
    budget: number;
    reactivite: number;
    potentiel: number;
  };
  leadsBySource: { source: string; count: number }[];
  leadsByStatut: { statut: string; count: number }[];
  performanceParCentre: { centre: string; leads: number; convertis: number }[];
}

export interface AmbassadeurData {
  familleId: string;
  nom: string;
  email: string;
  telephone: string;
  leadsRecommandes: Lead[];
  nombreRecommandations: number;
  scoreRecommandations: number;
}
