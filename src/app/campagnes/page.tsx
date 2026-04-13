"use client";

import { useEffect, useState, useRef } from "react";
import {
  cn,
  formatDate,
  CAMPAGNE_TYPE_LABELS,
  CAMPAGNE_STATUT_LABELS,
} from "@/lib/utils";
import { Campagne } from "@/types";

interface CreateCampagneData {
  nom: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  objectifLeads: number;
  budget: number;
  description: string;
}

export default function CampagnesPage() {
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCampagneData>({
    nom: "",
    type: "",
    dateDebut: "",
    dateFin: "",
    objectifLeads: 0,
    budget: 0,
    description: "",
  });
  const centreIdRef = useRef<string | null>(null);

  const fetchCampagnes = async (centreId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (centreId) params.append("centreId", centreId);
      const response = await fetch(`/api/campagnes?${params}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setCampagnes(data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const centreId = localStorage.getItem("selectedCentreId");
    centreIdRef.current = centreId;
    fetchCampagnes(centreId || undefined);

    const handleCentreChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      centreIdRef.current = customEvent.detail;
      fetchCampagnes(customEvent.detail || undefined);
    };

    window.addEventListener("centreFilterChanged", handleCentreChange);
    return () => {
      window.removeEventListener("centreFilterChanged", handleCentreChange);
    };
  }, []);

  const handleCreateCampagne = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom || !formData.type || !formData.dateDebut || !formData.dateFin) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/campagnes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          objectifLeads: formData.objectifLeads || 0,
          budget: formData.budget || 0,
        }),
      });

      if (!response.ok) throw new Error("Erreur");
      const newCampagne = await response.json();

      setCampagnes([...campagnes, newCampagne]);
      setShowModal(false);
      setFormData({
        nom: "",
        type: "",
        dateDebut: "",
        dateFin: "",
        objectifLeads: 0,
        budget: 0,
        description: "",
      });
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutColor = (statut: string): string => {
    if (statut === "planifiee") return "bg-blue-50 border-blue-200";
    if (statut === "active") return "bg-green-50 border-green-200";
    return "bg-gray-50 border-gray-200";
  };

  const getStatutBadgeColor = (statut: string): string => {
    if (statut === "planifiee") return "badge-blue";
    if (statut === "active") return "badge-green";
    return "badge-gray";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-gray-600 mt-1">
            {campagnes.length} campagne(s)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-gold"
        >
          + Créer une campagne
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-600">
          Chargement des campagnes...
        </div>
      ) : campagnes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campagnes.map((campagne) => {
            const leadsGenerated = campagne.leads?.length || 0;
            const leadsConverted = campagne.leads?.filter(
              (l) => l.statut === "converti"
            ).length || 0;
            const tauxConversion =
              leadsGenerated > 0
                ? Math.round((leadsConverted / leadsGenerated) * 100)
                : 0;
            const progressPercent =
              campagne.objectifLeads > 0
                ? Math.min((leadsGenerated / campagne.objectifLeads) * 100, 100)
                : 0;

            return (
              <div
                key={campagne.id}
                className={cn(
                  "card p-6 border-l-4",
                  campagne.statut === "planifiee"
                    ? "border-l-blue-500"
                    : campagne.statut === "active"
                    ? "border-l-green-500"
                    : "border-l-gray-500"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {campagne.nom}
                    </h3>
                  </div>
                  <span className={cn("badge", getStatutBadgeColor(campagne.statut))}>
                    {CAMPAGNE_STATUT_LABELS[campagne.statut] || campagne.statut}
                  </span>
                </div>

                {/* Type & Period */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge badge-navy">
                    {CAMPAGNE_TYPE_LABELS[campagne.type] || campagne.type}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatDate(campagne.dateDebut)} → {formatDate(campagne.dateFin)}
                  </span>
                </div>

                {/* Description */}
                {campagne.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {campagne.description}
                  </p>
                )}

                {/* Stats */}
                <div className="space-y-3 mb-4 pb-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Objectif leads
                    </span>
                    <span className="font-semibold text-gray-900">
                      {campagne.objectifLeads}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Leads générés
                    </span>
                    <span className="font-semibold text-gray-900">
                      {leadsGenerated}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Convertis
                    </span>
                    <span className="font-semibold text-green-600">
                      {leadsConverted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Taux conversion
                    </span>
                    <span className="font-semibold text-gray-900">
                      {tauxConversion}%
                    </span>
                  </div>
                  {campagne.budget && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Budget CHF
                      </span>
                      <span className="font-semibold text-gray-900">
                        {campagne.budget.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Progression
                    </span>
                    <span className="text-xs font-semibold text-gray-900">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bar-chart-bar"
                      style={{
                        width: `${progressPercent}%`,
                        background: "#C9A84C",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-600">
          Aucune campagne trouvée
        </div>
      )}

      {/* Modal Créer Campagne */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div
              className="modal-header"
              style={{ background: "#152952" }}
            >
              <h2>Créer une campagne</h2>
            </div>

            <form onSubmit={handleCreateCampagne} className="p-6 space-y-4">
              <div>
                <label className="label">Nom *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Type *</label>
                <select
                  className="select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="">Choisir un type</option>
                  {Object.entries(CAMPAGNE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Date début *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dateDebut}
                  onChange={(e) =>
                    setFormData({ ...formData, dateDebut: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Date fin *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dateFin}
                  onChange={(e) =>
                    setFormData({ ...formData, dateFin: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Objectif leads</label>
                <input
                  type="number"
                  className="input"
                  value={formData.objectifLeads || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      objectifLeads: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">Budget CHF</label>
                <input
                  type="number"
                  className="input"
                  step="0.01"
                  value={formData.budget || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-gold flex-1"
                  disabled={submitting}
                >
                  {submitting ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
