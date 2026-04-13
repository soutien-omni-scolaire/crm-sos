"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  cn,
  formatDate,
  STATUT_FAMILLE_LABELS,
  SOURCE_LABELS,
} from "@/lib/utils";
import { Famille, Centre } from "@/types";

interface CreateFamilleData {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  centrePrincipalId: string;
  sourceOrigine: string;
}

export default function FamillesPage() {
  const [familles, setFamilles] = useState<Famille[]>([]);
  const [filteredFamilles, setFilteredFamilles] = useState<Famille[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateFamilleData>({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    centrePrincipalId: "",
    sourceOrigine: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const centreIdRef = useRef<string | null>(null);

  const fetchFamilles = async (centreId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (centreId) params.append("centreId", centreId);
      const response = await fetch(`/api/familles?${params}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setFamilles(data);
      applyFilters(data, searchTerm, statutFilter);
    } catch (err) {
      console.error("Erreur chargement familles:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const response = await fetch("/api/centres");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setCentres(data);
      if (data.length > 0 && !formData.centrePrincipalId) {
        setFormData((prev) => ({
          ...prev,
          centrePrincipalId: data[0].id,
        }));
      }
    } catch (err) {
      console.error("Erreur chargement centres:", err);
    }
  };

  const applyFilters = (
    familles: Famille[],
    search: string,
    statut: string
  ) => {
    let filtered = familles;

    if (statut) {
      filtered = filtered.filter((f) => f.statut === statut);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.prenom.toLowerCase().includes(searchLower) ||
          f.nom.toLowerCase().includes(searchLower) ||
          f.telephone.includes(search)
      );
    }

    setFilteredFamilles(filtered);
  };

  useEffect(() => {
    fetchCentres();
    const centreId = localStorage.getItem("selectedCentreId");
    centreIdRef.current = centreId;
    fetchFamilles(centreId || undefined);

    const handleCentreChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      centreIdRef.current = customEvent.detail;
      fetchFamilles(customEvent.detail || undefined);
    };

    window.addEventListener("centreFilterChanged", handleCentreChange);
    return () => {
      window.removeEventListener("centreFilterChanged", handleCentreChange);
    };
  }, []);

  useEffect(() => {
    applyFilters(familles, searchTerm, statutFilter);
  }, [searchTerm, statutFilter, familles]);

  const handleCreateFamille = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prenom || !formData.nom || !formData.telephone) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/familles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur lors de la création");
      const newFamille = await response.json();

      setFamilles([...familles, newFamille]);
      setShowModal(false);
      setFormData({
        prenom: "",
        nom: "",
        telephone: "",
        email: "",
        centrePrincipalId: centres[0]?.id || "",
        sourceOrigine: "",
      });
    } catch (err) {
      console.error("Erreur création famille:", err);
      alert("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFidelidyStars = (score: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "score-dot",
              i < score ? "score-dot-filled" : "score-dot-empty"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Familles</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {filteredFamilles.length} famille{filteredFamilles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-gold w-full sm:w-auto"
        >
          + Nouvelle famille
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label className="label">Rechercher</label>
          <input
            type="text"
            className="input"
            placeholder="Nom, prénom, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="label">Statut</label>
          <select
            className="select"
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            Chargement des familles...
          </div>
        ) : filteredFamilles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Centre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Élèves
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Inscriptions actives
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Fidélité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFamilles.map((famille) => {
                  const activeInscriptions =
                    famille.eleves?.reduce((acc, eleve) => {
                      return (
                        acc +
                        (eleve.inscriptions?.filter(
                          (i) => i.statut === "en_cours"
                        ).length || 0)
                      );
                    }, 0) || 0;

                  return (
                    <tr
                      key={famille.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors table-row-clickable"
                      onClick={() => {
                        window.location.href = `/familles/${famille.id}`;
                      }}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {famille.nom}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {famille.prenom}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {famille.telephone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {famille.centrePrincipal?.nom || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {famille.eleves?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {activeInscriptions}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {famille.sourceOrigine && (
                          <span className="badge badge-navy">
                            {SOURCE_LABELS[famille.sourceOrigine] ||
                              famille.sourceOrigine}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {renderFidelidyStars(famille.scoreFidelite || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={cn(
                            "badge",
                            famille.statut === "actif"
                              ? "badge-green"
                              : "badge-gray"
                          )}
                        >
                          {STATUT_FAMILLE_LABELS[famille.statut] || famille.statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-600">
            Aucune famille trouvée
          </div>
        )}
      </div>

      {/* Modal Nouvelle Famille */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div
              className="modal-header"
              style={{ background: "#152952" }}
            >
              <h2>Nouvelle famille</h2>
            </div>

            <form onSubmit={handleCreateFamille} className="p-6 space-y-4">
              <div>
                <label className="label">Prénom *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  required
                />
              </div>

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
                <label className="label">Téléphone *</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Centre principal *</label>
                <select
                  className="select"
                  value={formData.centrePrincipalId}
                  onChange={(e) =>
                    setFormData({ ...formData, centrePrincipalId: e.target.value })
                  }
                  required
                >
                  <option value="">Choisir un centre</option>
                  {centres.map((centre) => (
                    <option key={centre.id} value={centre.id}>
                      {centre.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Source</label>
                <select
                  className="select"
                  value={formData.sourceOrigine}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceOrigine: e.target.value })
                  }
                >
                  <option value="">Choisir une source</option>
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
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
