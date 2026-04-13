"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  cn,
  formatDate,
  STATUT_LEAD_LABELS,
  SOURCE_LABELS,
  TYPE_TACHE_LABELS,
  isOverdue,
  getLeadScore,
} from "@/lib/utils";
import { DashboardStats, Tache, Lead } from "@/types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement du tableau de bord:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Erreur lors du chargement des données</p>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    colorClass,
    isAlert = false,
  }: {
    title: string;
    value: string | number;
    colorClass: string;
    isAlert?: boolean;
  }) => (
    <div className={cn("stat-card", colorClass)}>
      <p className="stat-label">{title}</p>
      <p className={cn("stat-value", isAlert && "stat-value-alert")}>
        {value}
      </p>
    </div>
  );

  const overdueTasks = stats.tachesAujourdhui.filter((t) =>
    isOverdue(t.dateEcheance)
  ).length;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Leads en cours"
          value={stats.leadsEnCours}
          colorClass="stat-card-blue"
        />
        <StatCard
          title="Relances en retard"
          value={stats.relancesEnRetard}
          colorClass="stat-card-red"
          isAlert={stats.relancesEnRetard > 0}
        />
        <StatCard
          title="Convertis ce mois"
          value={stats.convertisCeMois}
          colorClass="stat-card-gold"
        />
        <StatCard
          title="Familles actives"
          value={stats.famillesActives}
          colorClass="stat-card-green"
        />
        <StatCard
          title="Taux de conversion"
          value={`${stats.tauxConversion.toFixed(1)}%`}
          colorClass="stat-card-purple"
        />
        <StatCard
          title="Revenu potentiel CHF"
          value={`${stats.revenueEstime.toLocaleString("fr-CH")}`}
          colorClass="stat-card-orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mes tâches du jour */}
        <div className="lg:col-span-1 card overflow-hidden">
          <div className="section-header">
            <h2 className="section-title">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ color: "#C9A84C" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5-15a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Mes tâches
            </h2>
            {overdueTasks > 0 && (
              <span className="badge badge-red">{overdueTasks}</span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {stats.tachesAujourdhui && stats.tachesAujourdhui.length > 0 ? (
              stats.tachesAujourdhui.slice(0, 5).map((tache: Tache) => (
                <div
                  key={tache.id}
                  className="task-item"
                >
                  <div className="task-check" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tache.titre}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(tache.dateEcheance)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                Aucune tâche
              </div>
            )}
          </div>
        </div>

        {/* Entonnoir de conversion */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="section-header">
            <h2 className="section-title">Entonnoir de conversion</h2>
          </div>
          <div className="p-6 space-y-4">
            {stats.entonnoir && (
              <>
                {[
                  { label: "Nouveau", value: stats.entonnoir.nouveau, color: "#2656A0" },
                  { label: "Contacté", value: stats.entonnoir.contacte, color: "#F97316" },
                  { label: "Qualifié", value: stats.entonnoir.qualifie, color: "#A855F7" },
                  { label: "En attente", value: stats.entonnoir.en_attente, color: "#6B7280" },
                  { label: "Converti", value: stats.entonnoir.converti, color: "#10B981" },
                  { label: "Perdu", value: stats.entonnoir.perdu, color: "#EF4444" },
                ].map((step, idx) => {
                  const total =
                    stats.entonnoir.nouveau +
                    stats.entonnoir.contacte +
                    stats.entonnoir.qualifie +
                    stats.entonnoir.en_attente +
                    stats.entonnoir.converti +
                    stats.entonnoir.perdu;
                  const percentage = total > 0 ? (step.value / total) * 100 : 0;
                  const prevTotal = [
                    stats.entonnoir.nouveau,
                    stats.entonnoir.contacte,
                    stats.entonnoir.qualifie,
                    stats.entonnoir.en_attente,
                    stats.entonnoir.converti,
                  ]
                    .slice(0, idx)
                    .reduce((a, b) => a + b, 0);
                  const dropoff =
                    idx > 0 && prevTotal > 0
                      ? (((prevTotal - step.value) / prevTotal) * 100).toFixed(0)
                      : null;

                  return (
                    <div key={step.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {step.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold"
                            style={{ color: step.color }}
                          >
                            {step.value}
                          </span>
                          <span className="text-xs text-gray-500">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-md overflow-hidden">
                        <div
                          className="bar-chart-bar"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: step.color,
                          }}
                        />
                      </div>
                      {dropoff && (
                        <p className="text-xs text-red-600">
                          ↓ {dropoff}% perte
                        </p>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Derniers leads */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <h2 className="section-title">Derniers leads</h2>
          <Link href="/leads" className="section-link">
            Voir tout →
          </Link>
        </div>

        {stats.derniersLeads && stats.derniersLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Parent</th>
                  <th className="table-header">Téléphone</th>
                  <th className="table-header">Source</th>
                  <th className="table-header">Centre</th>
                  <th className="table-header">Offre</th>
                  <th className="table-header">Score</th>
                  <th className="table-header">Statut</th>
                  <th className="table-header">Prochaine relance</th>
                </tr>
              </thead>
              <tbody>
                {stats.derniersLeads.slice(0, 5).map((lead: Lead) => {
                  const score = getLeadScore(lead);
                  const filledDots = Math.ceil(score / 1);

                  return (
                    <tr
                      key={lead.id}
                      className="table-row-clickable"
                      onClick={() => (window.location.href = `/leads/${lead.id}`)}
                    >
                      <td className="table-cell font-medium">
                        {lead.prenomParent} {lead.nomParent || ""}
                      </td>
                      <td className="table-cell text-xs">{lead.telephone}</td>
                      <td className="table-cell">
                        <span className="badge badge-navy text-xs">
                          {SOURCE_LABELS[lead.source] || lead.source}
                        </span>
                      </td>
                      <td className="table-cell text-xs">
                        {lead.centre?.nom || "—"}
                      </td>
                      <td className="table-cell text-xs">
                        {lead.offreDemandee || "—"}
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "score-dot",
                                i < filledDots
                                  ? "score-dot-filled"
                                  : "score-dot-empty"
                              )}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-navy text-xs">
                          {STATUT_LEAD_LABELS[lead.statut] || lead.statut}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "table-cell text-xs",
                          lead.dateProchaineRelance &&
                            isOverdue(lead.dateProchaineRelance)
                            ? "font-medium"
                            : ""
                        )}
                        style={{
                          color:
                            lead.dateProchaineRelance &&
                            isOverdue(lead.dateProchaineRelance)
                              ? "#EF4444"
                              : undefined,
                        }}
                      >
                        {formatDate(lead.dateProchaineRelance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Aucun lead pour le moment
          </div>
        )}
      </div>
    </div>
  );
}
