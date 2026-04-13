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

type TimePeriod = "today" | "week" | "month" | "year";

const PERIOD_LABELS: Record<TimePeriod, string> = {
  today: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
  year: "Cette annee",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("month");

  const fetchDashboard = async (selectedPeriod: TimePeriod) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard?period=${selectedPeriod}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erreur lors du chargement du tableau de bord:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(period);
  }, [period]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-500">Erreur lors du chargement des donnees</p>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    colorClass,
    icon,
    isAlert = false,
  }: {
    title: string;
    value: string | number;
    colorClass: string;
    icon: React.ReactNode;
    isAlert?: boolean;
  }) => (
    <div className={cn("stat-card", colorClass)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className={cn("stat-value mt-1", isAlert && "stat-value-alert")}>
            {value}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-white/50 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );

  const overdueTasks = (stats.tachesAujourdhui || []).filter((t) =>
    isOverdue(t.dateEcheance)
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: "#0F1E3D" }}>
            Vue d&apos;ensemble
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {PERIOD_LABELS[period]}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.entries(PERIOD_LABELS) as [TimePeriod, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all",
                  period === key
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
                style={
                  period === key
                    ? { backgroundColor: "#0F1E3D" }
                    : {}
                }
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        <StatCard
          title="Leads en cours"
          value={stats.leadsEnCours}
          colorClass="stat-card-blue"
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          }
        />
        <StatCard
          title="Relances en retard"
          value={stats.relancesEnRetard}
          colorClass="stat-card-red"
          isAlert={stats.relancesEnRetard > 0}
          icon={
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          title="Convertis ce mois"
          value={stats.convertisCeMois}
          colorClass="stat-card-gold"
          icon={
            <svg className="w-5 h-5" style={{ color: "#C9A84C" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          title="Familles actives"
          value={stats.famillesActives}
          colorClass="stat-card-green"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
        />
        <StatCard
          title="Taux de conversion"
          value={`${stats.tauxConversion.toFixed(1)}%`}
          colorClass="stat-card-purple"
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
        />
        <StatCard
          title="Revenu potentiel CHF"
          value={`${stats.revenueEstime.toLocaleString("fr-CH")}`}
          colorClass="stat-card-orange"
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Mes tâches du jour */}
        <div className="lg:col-span-1 card overflow-hidden">
          <div className="section-header">
            <h2 className="section-title">
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ color: "#C9A84C" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Mes taches
            </h2>
            {overdueTasks > 0 && (
              <span className="badge badge-red text-xs">{overdueTasks} en retard</span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {(stats.tachesAujourdhui || []).length > 0 ? (
              (stats.tachesAujourdhui || []).slice(0, 6).map((tache: Tache) => {
                const overdue = isOverdue(tache.dateEcheance);
                return (
                  <div
                    key={tache.id}
                    className={cn("task-item", overdue && "bg-red-50/50")}
                  >
                    <div className={cn(
                      "task-check",
                      overdue && "border-red-300"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tache.titre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-xs font-medium",
                          overdue ? "text-red-600" : "text-gray-500"
                        )}>
                          {formatDate(tache.dateEcheance)}
                        </span>
                        {tache.type && (
                          <span className="badge badge-navy text-xs py-0">
                            {TYPE_TACHE_LABELS[tache.type] || tache.type}
                          </span>
                        )}
                      </div>
                    </div>
                    {overdue && (
                      <span className="text-red-500 text-xs font-bold flex-shrink-0">
                        !
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-8 text-center">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-sm text-gray-500">Aucune tache a traiter</p>
              </div>
            )}
          </div>

          {(stats.tachesAujourdhui || []).length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <Link href="/taches" className="section-link text-xs">
                Voir toutes les taches &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Entonnoir de conversion */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="section-header">
            <h2 className="section-title">
              <svg className="h-5 w-5 flex-shrink-0" style={{ color: "#2656A0" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
              </svg>
              Entonnoir de conversion
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {stats.entonnoir ? (
              <>
                {[
                  { label: "Nouveau", value: stats.entonnoir?.nouveau || 0, color: "#2656A0" },
                  { label: "Contacte", value: stats.entonnoir?.contacte || 0, color: "#F97316" },
                  { label: "Qualifie", value: stats.entonnoir?.qualifie || 0, color: "#A855F7" },
                  { label: "En attente", value: stats.entonnoir?.en_attente || 0, color: "#6B7280" },
                  { label: "Converti", value: stats.entonnoir?.converti || 0, color: "#10B981" },
                  { label: "Perdu", value: stats.entonnoir?.perdu || 0, color: "#EF4444" },
                ].map((step) => {
                  const total =
                    (stats.entonnoir?.nouveau || 0) +
                    (stats.entonnoir?.contacte || 0) +
                    (stats.entonnoir?.qualifie || 0) +
                    (stats.entonnoir?.en_attente || 0) +
                    (stats.entonnoir?.converti || 0) +
                    (stats.entonnoir?.perdu || 0);
                  const percentage = total > 0 ? (step.value / total) * 100 : 0;

                  return (
                    <div key={step.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {step.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-bold"
                            style={{ color: step.color }}
                          >
                            {step.value}
                          </span>
                          <span className="text-xs text-gray-400">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-100 rounded-md overflow-hidden">
                        <div
                          className="bar-chart-bar"
                          style={{
                            width: `${Math.max(percentage, 2)}%`,
                            backgroundColor: step.color,
                            height: "100%",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Aucune donnee de conversion
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sources de leads */}
      {stats.leadsBySource && stats.leadsBySource.length > 0 && (
        <div className="card overflow-hidden">
          <div className="section-header">
            <h2 className="section-title">
              <svg className="h-5 w-5 flex-shrink-0" style={{ color: "#C9A84C" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
              Leads par source
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.leadsBySource.map((item) => (
                <div key={item.source} className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-2xl font-bold" style={{ color: "#152952" }}>
                    {item.count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {SOURCE_LABELS[item.source] || item.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Derniers leads */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <h2 className="section-title">
            <svg className="h-5 w-5 flex-shrink-0" style={{ color: "#2656A0" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Derniers leads
          </h2>
          <Link href="/leads" className="section-link">
            Voir tout &rarr;
          </Link>
        </div>

        {(stats.derniersLeads || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Parent</th>
                  <th className="table-header hidden sm:table-cell">Telephone</th>
                  <th className="table-header">Source</th>
                  <th className="table-header hidden md:table-cell">Centre</th>
                  <th className="table-header">Statut</th>
                  <th className="table-header hidden lg:table-cell">Relance</th>
                </tr>
              </thead>
              <tbody>
                {(stats.derniersLeads || []).slice(0, 5).map((lead: Lead) => (
                  <tr
                    key={lead.id}
                    className="table-row-clickable"
                    onClick={() => (window.location.href = `/leads/${lead.id}`)}
                  >
                    <td className="table-cell font-medium">
                      <div>
                        {lead.prenomParent} {lead.nomParent || ""}
                        <p className="text-xs text-gray-400 sm:hidden mt-0.5">
                          {lead.telephone}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell text-xs hidden sm:table-cell">{lead.telephone}</td>
                    <td className="table-cell">
                      <span className="badge badge-navy text-xs">
                        {SOURCE_LABELS[lead.source] || lead.source}
                      </span>
                    </td>
                    <td className="table-cell text-xs hidden md:table-cell">
                      {lead.centre?.nom || "\u2014"}
                    </td>
                    <td className="table-cell">
                      <span
                        className={cn(
                          "badge text-xs",
                          lead.statut === "nouveau" && "badge-blue",
                          lead.statut === "contacte" && "badge-orange",
                          lead.statut === "qualifie" && "badge-purple",
                          lead.statut === "en_attente" && "badge-gray",
                          lead.statut === "converti" && "badge-green",
                          lead.statut === "perdu" && "badge-red"
                        )}
                      >
                        {STATUT_LEAD_LABELS[lead.statut] || lead.statut}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "table-cell text-xs hidden lg:table-cell",
                        lead.dateProchaineRelance &&
                          isOverdue(lead.dateProchaineRelance)
                          ? "font-medium text-red-600"
                          : ""
                      )}
                    >
                      {formatDate(lead.dateProchaineRelance)}
                    </td>
                  </tr>
                ))}
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
