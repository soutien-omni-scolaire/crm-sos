"use client";

import { useEffect, useState, useRef } from "react";
import { cn, SOURCE_LABELS, RAISON_PERTE_LABELS, OFFRE_LABELS } from "@/lib/utils";
import { Lead, AnalyticsData } from "@/types";

interface AnalyticsResponse extends AnalyticsData {
  raisonsDePerteData?: { raison: string; count: number }[];
  conversionParSource?: { source: string; count: number; converted: number }[];
  topOffres?: { offre: string; count: number }[];
  performanceParCentre?: {
    centre: string;
    code: string;
    leads: number;
    convertis: number;
  }[];
  delaiMoyenConversion?: number;
  leadsParMois?: { mois: string; count: number }[];
}

export default function AnalytiquePage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const centreIdRef = useRef<string | null>(null);

  const fetchAnalytics = async (centreId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (centreId) params.append("centreId", centreId);
      const response = await fetch(`/api/analytique?${params}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const centreId = localStorage.getItem("selectedCentreId");
    centreIdRef.current = centreId;
    fetchAnalytics(centreId || undefined);

    const handleCentreChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      centreIdRef.current = customEvent.detail;
      fetchAnalytics(customEvent.detail || undefined);
    };

    window.addEventListener("centreFilterChanged", handleCentreChange);
    return () => {
      window.removeEventListener("centreFilterChanged", handleCentreChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Erreur lors du chargement</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytique</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble des performances</p>
      </div>

      {/* Conversion par Source */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="gold-divider" />
          <h3 className="section-title">Conversion par source</h3>
        </div>

        <div className="space-y-4 mt-4">
          {analytics.conversionParSource && analytics.conversionParSource.length > 0 ? (
            analytics.conversionParSource.map((item) => {
              const conversionRate =
                item.count > 0 ? Math.round((item.converted / item.count) * 100) : 0;

              return (
                <div key={item.source} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {SOURCE_LABELS[item.source] || item.source}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {conversionRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bar-chart-bar"
                        style={{
                          width: `${conversionRate}%`,
                          background: "#C9A84C",
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {item.converted}/{item.count}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Raisons de Perte */}
      {analytics.raisonsDePerteData &&
        analytics.raisonsDePerteData.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="gold-divider" />
              <h3 className="section-title">Raisons de perte</h3>
            </div>

            <div className="space-y-4 mt-4">
              {analytics.raisonsDePerteData.map((item) => {
                const maxCount = Math.max(
                  ...analytics.raisonsDePerteData!.map((r) => r.count)
                );
                const percentage = (item.count / maxCount) * 100;
                const total = analytics.raisonsDePerteData!.reduce(
                  (sum, r) => sum + r.count,
                  0
                );
                const pct = Math.round((item.count / total) * 100);

                return (
                  <div key={item.raison} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {RAISON_PERTE_LABELS[item.raison] || item.raison}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bar-chart-bar"
                        style={{
                          width: `${percentage}%`,
                          background: "#EF4444",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Top Offres Demandées */}
      {analytics.topOffres && analytics.topOffres.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="gold-divider" />
            <h3 className="section-title">Top offres demandées</h3>
          </div>

          <div className="space-y-3 mt-4">
            {analytics.topOffres.map((item, index) => (
              <div
                key={item.offre}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
              >
                <div
                  className={cn(
                    "font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full",
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : index === 1
                      ? "bg-gray-300 text-gray-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {OFFRE_LABELS[item.offre] || item.offre}
                  </p>
                  <p className="text-sm text-gray-600">{item.count} demandes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance par Centre */}
      {analytics.performanceParCentre &&
        analytics.performanceParCentre.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="gold-divider" />
              <h3 className="section-title">Performance par centre</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {analytics.performanceParCentre.map((perf) => {
                const tauxConversion =
                  perf.leads > 0
                    ? Math.round((perf.convertis / perf.leads) * 100)
                    : 0;

                return (
                  <div
                    key={perf.code}
                    className="stat-card stat-card-blue"
                  >
                    <div
                      className="stat-value"
                      style={{ fontSize: "2.5rem", color: "#0F1E3D" }}
                    >
                      {perf.code}
                    </div>
                    <div className="space-y-2 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Leads</p>
                        <p className="font-semibold text-gray-900">
                          {perf.leads}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Taux conversion</p>
                        <p className="font-semibold text-gray-900">
                          {tauxConversion}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Convertis</p>
                        <p className="font-semibold text-green-600">
                          {perf.convertis}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Délai Moyen de Conversion */}
      {analytics.delaiMoyenConversion !== undefined && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="gold-divider" />
            <h3 className="section-title">Délai moyen de conversion</h3>
          </div>

          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="stat-value" style={{ color: "#152952" }}>
                {analytics.delaiMoyenConversion}
              </div>
              <p className="text-sm text-gray-600 mt-2">jours</p>
            </div>
          </div>
        </div>
      )}

      {/* Évolution Mensuelle */}
      {analytics.leadsParMois && analytics.leadsParMois.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="gold-divider" />
            <h3 className="section-title">Évolution mensuelle</h3>
          </div>

          <div className="mt-4">
            <div className="flex items-end justify-center gap-2 h-48">
              {analytics.leadsParMois.map((item) => {
                const maxCount = Math.max(
                  ...analytics.leadsParMois!.map((m) => m.count)
                );
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                return (
                  <div
                    key={item.mois}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="relative w-full h-full flex items-end justify-center">
                      <div
                        className="bar-chart-bar w-full"
                        style={{
                          height: `${height}%`,
                          background: "#C9A84C",
                          minHeight: height > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center whitespace-nowrap">
                      {item.mois}
                    </p>
                    <p className="text-xs font-semibold text-gray-900">
                      {item.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
