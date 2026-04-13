"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  cn,
  formatDate,
  isOverdue,
  isToday,
  TYPE_TACHE_LABELS,
  STATUT_TACHE_LABELS,
  PRIORITE_LABELS,
} from "@/lib/utils";
import { Tache, Utilisateur, Centre } from "@/types";

interface CreateTacheData {
  titre: string;
  description: string;
  type: string;
  dateEcheance: string;
  priorite: string;
  assigneeId: string;
  leadId?: string;
  familleId?: string;
}

export default function TachesPage() {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [filteredTaches, setFilteredTaches] = useState<Tache[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState("a_faire");
  const [typeFilter, setTypeFilter] = useState("");
  const [prioriteFilter, setPrioriteFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTacheData>({
    titre: "",
    description: "",
    type: "",
    dateEcheance: "",
    priorite: "normale",
    assigneeId: "",
    leadId: "",
    familleId: "",
  });
  const centreIdRef = useRef<string | null>(null);

  const fetchTaches = async (centreId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (centreId) params.append("centreId", centreId);
      const response = await fetch(`/api/taches?${params}`);
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setTaches(data);
      applyFilters(data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUtilisateurs = async () => {
    try {
      const response = await fetch("/api/utilisateurs");
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setUtilisateurs(data);
      if (data.length > 0 && !formData.assigneeId) {
        setFormData((prev) => ({
          ...prev,
          assigneeId: data[0].id,
        }));
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const applyFilters = (allTaches: Tache[]) => {
    let filtered = allTaches;

    if (statutFilter) {
      filtered = filtered.filter((t) => t.statut === statutFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (prioriteFilter) {
      filtered = filtered.filter((t) => t.priorite === prioriteFilter);
    }

    setFilteredTaches(filtered);
  };

  useEffect(() => {
    fetchUtilisateurs();
    const centreId = localStorage.getItem("selectedCentreId");
    centreIdRef.current = centreId;
    fetchTaches(centreId || undefined);

    const handleCentreChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      centreIdRef.current = customEvent.detail;
      fetchTaches(customEvent.detail || undefined);
    };

    window.addEventListener("centreFilterChanged", handleCentreChange);
    return () => {
      window.removeEventListener("centreFilterChanged", handleCentreChange);
    };
  }, []);

  useEffect(() => {
    applyFilters(taches);
  }, [statutFilter, typeFilter, prioriteFilter, taches]);

  const handleCreateTache = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || !formData.dateEcheance || !formData.assigneeId) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/taches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          leadId: formData.leadId || null,
          familleId: formData.familleId || null,
        }),
      });

      if (!response.ok) throw new Error("Erreur");
      const newTache = await response.json();

      setTaches([...taches, newTache]);
      setShowModal(false);
      setFormData({
        titre: "",
        description: "",
        type: "",
        dateEcheance: "",
        priorite: "normale",
        assigneeId: utilisateurs[0]?.id || "",
        leadId: "",
        familleId: "",
      });
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDone = async (tacheId: string) => {
    try {
      const response = await fetch(`/api/taches/${tacheId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "fait" }),
      });

      if (!response.ok) throw new Error("Erreur");
      const updatedTache = await response.json();
      setTaches(taches.map((t) => (t.id === tacheId ? updatedTache : t)));
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const overdueCount = taches.filter(
    (t) => t.statut !== "fait" && isOverdue(t.dateEcheance)
  ).length;

  const getPriorityColor = (priorite: string): string => {
    if (priorite === "urgente") return "badge-red";
    if (priorite === "normale") return "badge-orange";
    return "badge-blue";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tâches</h1>
          <p className="text-gray-600 mt-1">
            {filteredTaches.length} tâche(s)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-gold"
        >
          + Nouvelle tâche
        </button>
      </div>

      {/* Warning Banner */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800">
            ⚠️ {overdueCount} tâche(s) en retard
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Statut</label>
            <select
              className="select w-full"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(STATUT_TACHE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Type</label>
            <select
              className="select w-full"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              {Object.entries(TYPE_TACHE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Priorité</label>
            <select
              className="select w-full"
              value={prioriteFilter}
              onChange={(e) => setPrioriteFilter(e.target.value)}
            >
              <option value="">Toutes les priorités</option>
              {Object.entries(PRIORITE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatutFilter("a_faire");
                setTypeFilter("");
                setPrioriteFilter("");
              }}
              className="btn btn-secondary w-full"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            Chargement des tâches...
          </div>
        ) : filteredTaches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                    ✓
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Assigné à
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Lié à
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTaches.map((tache) => (
                  <tr
                    key={tache.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      tache.statut === "fait"
                        ? "bg-green-50"
                        : isOverdue(tache.dateEcheance)
                        ? "bg-red-50"
                        : ""
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleMarkDone(tache.id)}
                        className={cn(
                          "task-check border-2 rounded",
                          tache.statut === "fait"
                            ? "bg-green-100 border-green-300"
                            : "border-gray-300"
                        )}
                      >
                        {tache.statut === "fait" && (
                          <span className="text-green-700 font-bold">✓</span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          tache.statut === "fait"
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        )}>
                          {tache.titre}
                        </p>
                        {tache.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {tache.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-navy">
                        {TYPE_TACHE_LABELS[tache.type] || tache.type}
                      </span>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm font-medium",
                      isOverdue(tache.dateEcheance) && tache.statut !== "fait"
                        ? "text-red-600"
                        : isToday(tache.dateEcheance)
                        ? "text-amber-600"
                        : "text-gray-600"
                    )}>
                      {formatDate(tache.dateEcheance)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("badge", getPriorityColor(tache.priorite))}>
                        {PRIORITE_LABELS[tache.priorite] || tache.priorite}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tache.assignee?.prenom} {tache.assignee?.nom || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {tache.lead ? (
                        <Link
                          href={`/leads/${tache.lead.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Lead: {tache.lead.prenomParent}
                        </Link>
                      ) : tache.famille ? (
                        <Link
                          href={`/familles/${tache.famille.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Famille: {tache.famille.prenom}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-600">
            Aucune tâche trouvée
          </div>
        )}
      </div>

      {/* Modal Nouvelle Tâche */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div
              className="modal-header"
              style={{ background: "#152952" }}
            >
              <h2>Nouvelle tâche</h2>
            </div>

            <form onSubmit={handleCreateTache} className="p-6 space-y-4">
              <div>
                <label className="label">Titre *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData({ ...formData, titre: e.target.value })
                  }
                  required
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

              <div>
                <label className="label">Type</label>
                <select
                  className="select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="">Choisir un type</option>
                  {Object.entries(TYPE_TACHE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Échéance *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dateEcheance}
                  onChange={(e) =>
                    setFormData({ ...formData, dateEcheance: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Priorité</label>
                <select
                  className="select"
                  value={formData.priorite}
                  onChange={(e) =>
                    setFormData({ ...formData, priorite: e.target.value })
                  }
                >
                  {Object.entries(PRIORITE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Assigné à *</label>
                <select
                  className="select"
                  value={formData.assigneeId}
                  onChange={(e) =>
                    setFormData({ ...formData, assigneeId: e.target.value })
                  }
                  required
                >
                  <option value="">Choisir une personne</option>
                  {utilisateurs.map((util) => (
                    <option key={util.id} value={util.id}>
                      {util.prenom} {util.nom}
                    </option>
                  ))}
                </select>
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
