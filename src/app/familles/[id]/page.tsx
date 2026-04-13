"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  cn,
  formatDate,
  formatDateTime,
  STATUT_FAMILLE_LABELS,
  STATUT_INSCRIPTION_LABELS,
  OFFRE_LABELS,
  isOverdue,
  isToday,
  TYPE_INTERACTION_LABELS,
} from "@/lib/utils";
import { Famille } from "@/types";

export default function FamilleDetailPage() {
  const params = useParams();
  const familleId = params.id as string;

  const [famille, setFamille] = useState<Famille | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFamille = async () => {
    try {
      const response = await fetch(`/api/familles/${familleId}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setFamille(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamille();
  }, [familleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!famille) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Famille non trouvée</p>
      </div>
    );
  }

  const monthsAsClient = Math.floor(
    (Date.now() - new Date(famille.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const totalInscriptions =
    famille.eleves?.reduce((acc, e) => acc + (e.inscriptions?.length || 0), 0) || 0;

  const uniqueOffres = new Set<string>();
  famille.eleves?.forEach((eleve) => {
    eleve.inscriptions?.forEach((insc) => {
      uniqueOffres.add(insc.typeOffre);
    });
  });

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-1.5">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={cn(
              "text-lg",
              i < score ? "text-yellow-400" : "text-gray-300"
            )}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/familles" className="text-sm text-blue-600 hover:underline">
          ← Retour aux familles
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {famille.prenom} {famille.nom}
          </h1>
          <p className="text-gray-600 mt-1">{famille.telephone}</p>
        </div>
        <div>
          <span
            className={cn(
              "badge",
              famille.statut === "actif" ? "badge-green" : "badge-gray"
            )}
          >
            {STATUT_FAMILLE_LABELS[famille.statut] || famille.statut}
          </span>
        </div>
      </div>

      {/* Parent Info Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="gold-divider" />
          <h3 className="section-title">Informations parent</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Prénom</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {famille.prenom}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Nom</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {famille.nom}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Téléphone
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {famille.telephone}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {famille.email || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Adresse</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {famille.adresse || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Centre</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {famille.centrePrincipal?.nom || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Valeur Client Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="gold-divider" />
          <h3 className="section-title">Valeur client</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="stat-card stat-card-blue">
            <div className="stat-value">{monthsAsClient}</div>
            <div className="stat-label">Mois client</div>
          </div>
          <div className="stat-card stat-card-gold">
            <div className="stat-value">{totalInscriptions}</div>
            <div className="stat-label">Total inscriptions</div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-value">{uniqueOffres.size}</div>
            <div className="stat-label">Offres souscrites</div>
          </div>
          <div className="stat-card stat-card-gold">
            <div className="mt-1">{renderStars(famille.scoreFidelite || 0)}</div>
            <div className="stat-label mt-2">Score fidélité</div>
          </div>
        </div>

        {uniqueOffres.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Offres souscrites
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueOffres).map((offre) => (
                <span key={offre} className="badge badge-gold">
                  {OFFRE_LABELS[offre] || offre}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Élèves Section */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <h3 className="section-title">Élèves ({famille.eleves?.length || 0})</h3>
          <button className="btn btn-gold btn-sm">+ Ajouter élève</button>
        </div>

        {famille.eleves && famille.eleves.length > 0 ? (
          <div className="space-y-4 p-5">
            {famille.eleves.map((eleve) => (
              <div
                key={eleve.id}
                className="card p-4 border-l-4"
                style={{ borderLeftColor: "#C9A84C" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {eleve.prenom} {eleve.nom}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {eleve.niveauScolaire || "—"} • {eleve.ecole || "—"}
                    </p>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    + Inscription
                  </button>
                </div>

                {eleve.inscriptions && eleve.inscriptions.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {eleve.inscriptions.map((insc) => (
                      <div
                        key={insc.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {OFFRE_LABELS[insc.typeOffre] || insc.typeOffre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(insc.dateDebut)} à {formatDate(insc.dateFin)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "badge",
                            insc.statut === "en_cours"
                              ? "badge-green"
                              : insc.statut === "termine"
                              ? "badge-gray"
                              : "badge-red"
                          )}
                        >
                          {STATUT_INSCRIPTION_LABELS[insc.statut] || insc.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">Aucune inscription</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-600">
            Aucun élève
          </div>
        )}
      </div>

      {/* Recommandations Section */}
      {famille.leadsRecommandes && famille.leadsRecommandes.length > 0 && (
        <div className="card overflow-hidden">
          <div className="section-header">
            <h3 className="section-title">
              Recommandations ({famille.leadsRecommandes.length})
            </h3>
          </div>

          <div className="space-y-3 p-5">
            {famille.leadsRecommandes.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="block p-4 bg-gray-50 rounded-md hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {lead.prenomParent} {lead.nomParent || ""}
                    </p>
                    <p className="text-sm text-gray-600">{lead.telephone}</p>
                  </div>
                  <span className="badge badge-navy">
                    {lead.statut}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Historique Section */}
      {famille.interactions && famille.interactions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="section-header">
            <h3 className="section-title">
              Historique ({famille.interactions.length})
            </h3>
          </div>

          <div className="space-y-0">
            {famille.interactions.slice(0, 10).map((interaction) => (
              <div
                key={interaction.id}
                className="task-item"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {TYPE_INTERACTION_LABELS[interaction.type] || interaction.type}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {interaction.resume}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDateTime(interaction.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tâches Section */}
      {famille.taches && famille.taches.length > 0 && (
        <div className="card overflow-hidden">
          <div className="section-header">
            <h3 className="section-title">
              Tâches ({famille.taches.length})
            </h3>
          </div>

          <div className="space-y-0">
            {famille.taches.slice(0, 10).map((tache) => (
              <div
                key={tache.id}
                className="task-item"
              >
                <div
                  className={cn(
                    "task-check border-2 rounded-md",
                    tache.statut === "fait"
                      ? "bg-green-100 border-green-300"
                      : "border-gray-300"
                  )}
                />
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    tache.statut === "fait"
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  )}>
                    {tache.titre}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {tache.description || "—"}
                  </p>
                  <p className={cn(
                    "text-xs mt-1",
                    isOverdue(tache.dateEcheance)
                      ? "text-red-600 font-medium"
                      : isToday(tache.dateEcheance)
                      ? "text-amber-600 font-medium"
                      : "text-gray-500"
                  )}>
                    {formatDate(tache.dateEcheance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
