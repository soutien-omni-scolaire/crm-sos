"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  cn,
  formatDate,
  formatDateTime,
  STATUT_LEAD_COLORS,
  STATUT_LEAD_LABELS,
  SOURCE_LABELS,
  OFFRE_LABELS,
  TYPE_INTERACTION_LABELS,
  RAISON_PERTE_LABELS,
  getLeadScore,
} from "@/lib/utils";
import { Lead, Interaction, Tache, Centre } from "@/types";
import { ConvertLeadModal } from "@/components/leads/ConvertLeadModal";
import { AddInteractionForm } from "@/components/leads/AddInteractionForm";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      const data = await response.json();
      setLead(data);
      setEditingScores({
        scoreUrgence: data.scoreUrgence || 0,
        scoreBudget: data.scoreBudget || 0,
        scoreReactivite: data.scoreReactivite || 0,
        scorePotentiel: data.scorePotentiel || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement du lead:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const handleScoreClick = async (scoreField: string) => {
    if (!lead) return;

    const currentValue = editingScores[scoreField] || 0;
    const nextValue = (currentValue + 1) % 6; // 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 0

    const updatedScores = {
      ...editingScores,
      [scoreField]: nextValue,
    };
    setEditingScores(updatedScores);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [scoreField]: nextValue }),
      });

      if (response.ok) {
        const updated = await response.json();
        setLead(updated);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du score:", error);
      // Revert on error
      setEditingScores(editingScores);
    }
  };

  const handleInteractionAdded = () => {
    setShowAddInteraction(false);
    fetchLead();
  };

  const handleConvertSuccess = (familleId: string) => {
    router.push(`/familles/${familleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Lead non trouvé</p>
      </div>
    );
  }

  const canConvert = lead.statut !== "converti" && lead.statut !== "perdu";
  const score = getLeadScore(lead);

  return (
    <div className="space-y-6">
      {/* Header with back link */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          ← Retour aux leads
        </Link>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {lead.prenomParent} {lead.nomParent || ""}
          </h1>
          <div className="flex gap-2 mt-2">
            <span
              className={cn(
                "badge text-sm",
                STATUT_LEAD_COLORS[lead.statut] ||
                  "bg-gray-100 text-gray-800"
              )}
            >
              {STATUT_LEAD_LABELS[lead.statut] || lead.statut}
            </span>
            <span className="badge badge-navy text-sm">
              {SOURCE_LABELS[lead.source] || lead.source}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {canConvert && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="btn btn-gold"
            >
              Convertir en client
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout (5fr 3fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: Lead details (5fr) */}
        <div className="lg:col-span-3">
          {/* Informations card */}
          <div className="card p-6">
            <h2 className="detail-card-header">Informations du lead</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Prénom</p>
                  <p className="font-medium text-gray-900">
                    {lead.prenomParent}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium text-gray-900">
                    {lead.nomParent || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{lead.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {lead.email || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="font-medium text-gray-900">
                    {SOURCE_LABELS[lead.source] || lead.source}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Centre</p>
                  <p className="font-medium text-gray-900">
                    {lead.centre?.nom || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Niveau scolaire</p>
                  <p className="font-medium text-gray-900">
                    {lead.niveauScolaire || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Matière demandée</p>
                  <p className="font-medium text-gray-900">
                    {lead.matiereDemandee || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Offre demandée</p>
                  <p className="font-medium text-gray-900">
                    {lead.offreDemandee
                      ? OFFRE_LABELS[lead.offreDemandee] || lead.offreDemandee
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre d'enfants</p>
                  <p className="font-medium text-gray-900">
                    {lead.nombreEnfants || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Prochaine relance</p>
                  <p className={cn(
                    "font-medium",
                    lead.dateProchaineRelance &&
                    new Date(lead.dateProchaineRelance) < new Date()
                      ? "text-red-600"
                      : "text-gray-900"
                  )}>
                    {formatDate(lead.dateProchaineRelance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créé par</p>
                  <p className="font-medium text-gray-900">
                    {lead.creePar?.prenom} {lead.creePar?.nom || "—"}
                  </p>
                </div>
              </div>

              {lead.campagne && (
                <div>
                  <p className="text-sm text-gray-600">Campagne</p>
                  <p className="font-medium text-gray-900">{lead.campagne.nom}</p>
                </div>
              )}
            </div>
          </div>

          {/* Score Commercial */}
          <div className="card p-6 mt-6">
            <h2 className="detail-card-header mb-6">Score Commercial</h2>

            <div className="space-y-4">
              <ScoreRow
                label="Urgence"
                value={editingScores.scoreUrgence || 0}
                onClick={() => handleScoreClick("scoreUrgence")}
              />
              <div className="gold-divider" />

              <ScoreRow
                label="Budget"
                value={editingScores.scoreBudget || 0}
                onClick={() => handleScoreClick("scoreBudget")}
              />
              <div className="gold-divider" />

              <ScoreRow
                label="Réactivité"
                value={editingScores.scoreReactivite || 0}
                onClick={() => handleScoreClick("scoreReactivite")}
              />
              <div className="gold-divider" />

              <ScoreRow
                label="Potentiel"
                value={editingScores.scorePotentiel || 0}
                onClick={() => handleScoreClick("scorePotentiel")}
              />

              <div className="pt-4 border-t border-gray-200 mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    Score global
                  </p>
                  <p className="text-2xl font-bold text-gold">
                    {score.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Raison de perte */}
          {lead.statut === "perdu" && lead.raisonPerte && (
            <div className="card p-6 mt-6 bg-red-50 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">
                Raison de la perte
              </h3>
              <p className="text-red-800">{RAISON_PERTE_LABELS[lead.raisonPerte] || lead.raisonPerte}</p>
            </div>
          )}

          {/* Tasks */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Tâches liées
            </h3>

            {lead.taches && lead.taches.length > 0 ? (
              <div className="space-y-3">
                {lead.taches.map((tache: Tache) => (
                  <div
                    key={tache.id}
                    className="task-item p-4 rounded border border-gray-200 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{tache.titre}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="badge badge-blue text-xs">
                          Échéance: {formatDate(tache.dateEcheance)}
                        </span>
                        {tache.priorite === "urgente" && (
                          <span className="badge badge-red text-xs">
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune tâche liée</p>
            )}
          </div>
        </div>

        {/* Right column: Interactions & Recommandation (2fr) */}
        <div className="lg:col-span-2">
          {/* Interactions */}
          <div className="card p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Historique</h3>
              <button
                onClick={() => setShowAddInteraction(true)}
                className="btn btn-sm btn-gold"
              >
                + Interaction
              </button>
            </div>

            {lead.interactions && lead.interactions.length > 0 ? (
              <div className="space-y-4">
                {[...lead.interactions]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((interaction: Interaction) => (
                    <div
                      key={interaction.id}
                      className="p-3 rounded bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="badge badge-navy text-xs whitespace-nowrap">
                          {TYPE_INTERACTION_LABELS[interaction.type] ||
                            interaction.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(interaction.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">
                        {interaction.resume}
                      </p>
                      {interaction.prochaineAction && (
                        <p className="text-xs text-gray-600 italic">
                          Prochaine action: {interaction.prochaineAction}
                        </p>
                      )}
                      {interaction.creePar && (
                        <p className="text-xs text-gray-500 mt-1">
                          Par {interaction.creePar.prenom}{" "}
                          {interaction.creePar.nom}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucune interaction</p>
            )}
          </div>

          {/* Recommandé par */}
          {lead.recommandePar && (
            <div className="card p-6 mt-6 bg-blue-50 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Recommandé par</h3>
              <Link
                href={`/familles/${lead.recommandePar.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {lead.recommandePar.prenom} {lead.recommandePar.nom}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showConvertModal && (
        <ConvertLeadModal
          lead={lead}
          onClose={() => setShowConvertModal(false)}
          onSuccess={handleConvertSuccess}
        />
      )}

      {showAddInteraction && (
        <AddInteractionForm
          leadId={leadId}
          onClose={() => setShowAddInteraction(false)}
          onSuccess={handleInteractionAdded}
        />
      )}
    </div>
  );
}

function ScoreRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 cursor-pointer" onClick={onClick}>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i < value ? "score-dot-filled bg-gold" : "score-dot-empty bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
}
