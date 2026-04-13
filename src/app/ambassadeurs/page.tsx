"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AmbassadeurRecord {
  familleId: string;
  familleNom: string;
  famillePrenom: string;
  telephone: string;
  email: string;
  nombreRecommandations: number;
  nombreConvertis: number;
}

export default function AmbassadeurPage() {
  const [ambassadeurs, setAmbassadeurs] = useState<AmbassadeurRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const centreIdRef = useRef<string | null>(null);

  const fetchAmbassadeurs = async (centreId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (centreId) params.append("centreId", centreId);
      const response = await fetch(`/api/ambassadeurs?${params}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();

      // Sort by number of recommendations (descending)
      const sorted = [...data].sort(
        (a, b) => b.nombreRecommandations - a.nombreRecommandations
      );

      setAmbassadeurs(sorted);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const centreId = localStorage.getItem("selectedCentreId");
    centreIdRef.current = centreId;
    fetchAmbassadeurs(centreId || undefined);

    const handleCentreChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      centreIdRef.current = customEvent.detail;
      fetchAmbassadeurs(customEvent.detail || undefined);
    };

    window.addEventListener("centreFilterChanged", handleCentreChange);
    return () => {
      window.removeEventListener("centreFilterChanged", handleCentreChange);
    };
  }, []);

  const getTierBadge = (recommandations: number): { tier: string; color: string; emoji: string } => {
    if (recommandations >= 5) {
      return { tier: "Or", color: "badge-gold", emoji: "⭐" };
    } else if (recommandations >= 3) {
      return { tier: "Argent", color: "badge-blue", emoji: "✨" };
    } else if (recommandations >= 1) {
      return { tier: "Bronze", color: "badge-orange", emoji: "💎" };
    }
    return { tier: "—", color: "badge-gray", emoji: "" };
  };

  const totalRecommandations = ambassadeurs.reduce(
    (sum, a) => sum + a.nombreRecommandations,
    0
  );
  const totalConvertis = ambassadeurs.reduce(
    (sum, a) => sum + a.nombreConvertis,
    0
  );
  const tauxConversion =
    totalRecommandations > 0
      ? Math.round((totalConvertis / totalRecommandations) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Programme Ambassadeurs
        </h1>
        <p className="text-gray-600 mt-2">
          Récompensez vos meilleurs ambassadeurs et recommandateurs
        </p>
      </div>

      {/* Global Stats Card */}
      <div
        className="gold-card"
        style={{
          background: "linear-gradient(135deg, #C9A84C 0%, #E0CA8D 50%, #C9A84C 100%)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium opacity-90">Total ambassadeurs</p>
            <p className="text-3xl font-bold mt-2">{ambassadeurs.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">Total recommandations</p>
            <p className="text-3xl font-bold mt-2">{totalRecommandations}</p>
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">Total convertis</p>
            <p className="text-3xl font-bold mt-2">{totalConvertis}</p>
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">Taux de conversion</p>
            <p className="text-3xl font-bold mt-2">{tauxConversion}%</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <h3 className="section-title">Classement des ambassadeurs</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">
            Chargement...
          </div>
        ) : ambassadeurs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Recommandations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Convertis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Taux
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ambassadeurs.map((amb, index) => {
                  const rank = index + 1;
                  const tauxAmb =
                    amb.nombreRecommandations > 0
                      ? Math.round(
                          (amb.nombreConvertis / amb.nombreRecommandations) * 100
                        )
                      : 0;
                  const tier = getTierBadge(amb.nombreRecommandations);

                  return (
                    <tr
                      key={amb.familleId}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        tier.tier === "Or" ? "border-l-4 border-l-yellow-400" : ""
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-gray-900">
                          {rank === 1
                            ? "🥇"
                            : rank === 2
                            ? "🥈"
                            : rank === 3
                            ? "🥉"
                            : `#${rank}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/familles/${amb.familleId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {amb.famillePrenom} {amb.familleNom}
                        </Link>
                        <p className="text-xs text-gray-600 mt-1">
                          {amb.telephone}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">
                          {amb.nombreRecommandations}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-green-600">
                          {amb.nombreConvertis}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {tauxAmb}%
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("badge", tier.color)}>
                          {tier.emoji} {tier.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="btn btn-secondary btn-sm">
                          Remercier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-600">
            Aucun ambassadeur pour le moment
          </div>
        )}
      </div>

      {/* Tier Information */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="gold-divider" />
          <h3 className="section-title">Niveaux de récompense</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 border-l-4 border-l-yellow-400 bg-yellow-50 rounded">
            <p className="font-bold text-gray-900">🥇 Tier Or</p>
            <p className="text-sm text-gray-600 mt-1">
              À partir de 5 recommandations
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Reconnaissance premium et avantages exclusifs
            </p>
          </div>

          <div className="p-4 border-l-4 border-l-gray-300 bg-gray-50 rounded">
            <p className="font-bold text-gray-900">🥈 Tier Argent</p>
            <p className="text-sm text-gray-600 mt-1">
              À partir de 3 recommandations
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Statut spécial et récompenses
            </p>
          </div>

          <div className="p-4 border-l-4 border-l-orange-400 bg-orange-50 rounded">
            <p className="font-bold text-gray-900">🥉 Tier Bronze</p>
            <p className="text-sm text-gray-600 mt-1">
              À partir de 1 recommandation
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Bienvenue dans le programme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
