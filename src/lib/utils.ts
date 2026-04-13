import { clsx, type ClassValue } from "clsx";
import type { Lead } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ============================================================
// LABELS & ENUMS
// ============================================================

export const STATUT_LEAD_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  qualifie: "Qualifié",
  en_attente: "En attente",
  converti: "Converti",
  perdu: "Perdu",
};

export const STATUT_LEAD_COLORS: Record<string, string> = {
  nouveau: "bg-blue-50 text-blue-900 border-blue-200",
  contacte: "bg-amber-50 text-amber-900 border-amber-200",
  qualifie: "bg-purple-50 text-purple-900 border-purple-200",
  en_attente: "bg-slate-50 text-slate-900 border-slate-200",
  converti: "bg-green-50 text-green-900 border-green-200",
  perdu: "bg-red-50 text-red-900 border-red-200",
};

export const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telephone: "Téléphone",
  instagram: "Instagram",
  site_web: "Site web",
  formulaire: "Formulaire",
  bouche_a_oreille: "Bouche-à-oreille",
  recommandation: "Recommandation",
  precommande: "Pré-commande",
  autre: "Autre",
};

export const OFFRE_LABELS: Record<string, string> = {
  CI: "Cours Individuels",
  ES: "Études Surveillées",
  CSP: "Cours Semi-Privé",
  SH: "Sessions Hebdomadaires",
  SI: "Stage Intensif",
  non_precise: "Non précisé",
};

export const OFFRE_CODES = ["CI", "ES", "CSP", "SH", "SI"] as const;

export const RAISON_PERTE_LABELS: Record<string, string> = {
  trop_cher: "Trop cher",
  mauvais_timing: "Mauvais timing",
  trouve_ailleurs: "A trouvé ailleurs",
  ne_repond_plus: "Ne répond plus",
  pas_de_creneau: "Pas de créneau",
  autre: "Autre",
};

export const CAMPAGNE_TYPE_LABELS: Record<string, string> = {
  rentree: "Rentrée",
  ecr: "Préparation ECR",
  stage_vacances: "Stage vacances",
  promotion: "Promotion",
  autre: "Autre",
};

export const CAMPAGNE_STATUT_LABELS: Record<string, string> = {
  planifiee: "Planifiée",
  active: "Active",
  terminee: "Terminée",
};

export const TYPE_INTERACTION_LABELS: Record<string, string> = {
  appel: "Appel",
  whatsapp: "WhatsApp",
  email: "Email",
  rdv: "Rendez-vous",
  note_interne: "Note interne",
};

export const TYPE_TACHE_LABELS: Record<string, string> = {
  relance_prospect: "Relance prospect",
  relance_reinscription: "Relance réinscription",
  relance_reactivation: "Réactivation",
  suivi: "Suivi",
  autre: "Autre",
};

export const STATUT_TACHE_LABELS: Record<string, string> = {
  a_faire: "À faire",
  fait: "Fait",
  annule: "Annulé",
};

export const PRIORITE_LABELS: Record<string, string> = {
  urgente: "Urgente",
  normale: "Normale",
};

export const STATUT_FAMILLE_LABELS: Record<string, string> = {
  actif: "Actif",
  inactif: "Inactif",
};

export const STATUT_ELEVE_LABELS: Record<string, string> = {
  actif: "Actif",
  inactif: "Inactif",
  sorti: "Sorti",
};

export const STATUT_INSCRIPTION_LABELS: Record<string, string> = {
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  responsable: "Responsable",
  assistant: "Assistant",
};

// ============================================================
// PIPELINE & ORDERING
// ============================================================

export const PIPELINE_ORDER = [
  "nouveau",
  "contacte",
  "qualifie",
  "en_attente",
  "converti",
  "perdu",
] as const;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

// ============================================================
// SCORING FUNCTIONS
// ============================================================

export function getLeadScore(lead: Lead): number {
  const scores = [
    lead.scoreUrgence,
    lead.scoreBudget,
    lead.scoreReactivite,
    lead.scorePotentiel,
  ];
  const nonZeroScores = scores.filter((s) => s > 0);

  if (nonZeroScores.length === 0) return 0;

  const sum = nonZeroScores.reduce((a, b) => a + b, 0);
  return Math.round((sum / nonZeroScores.length) * 10) / 10;
}

export function getScoreColor(score: number): string {
  if (score === 0) return "text-gray-400";
  if (score < 2) return "text-red-600";
  if (score < 3) return "text-orange-600";
  if (score < 4) return "text-yellow-600";
  return "text-green-600";
}
