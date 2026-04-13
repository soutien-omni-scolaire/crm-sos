"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  cn,
  formatDate,
  STATUT_LEAD_LABELS,
  SOURCE_LABELS,
  OFFRE_LABELS,
  isOverdue,
  getLeadScore,
} from "@/lib/utils";
import { Lead } from "@/types";
import { NewLeadModal } from "@/components/leads/NewLeadModal";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if ((window as any).__centreFilter) {
        params.append("centreId", (window as any).__centreFilter);
      }
      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Erreur lors du chargement des leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    const handleCentreFilterChanged = () => {
      fetchLeads();
    };

    window.addEventListener("centreFilterChanged", handleCentreFilterChanged);
    return () =>
      window.removeEventListener("centreFilterChanged", handleCentreFilterChanged);
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.prenomParent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.nomParent?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      lead.telephone.includes(searchTerm);

    const matchesStatut = !statutFilter || lead.statut === statutFilter;
    const matchesSource = !sourceFilter || lead.source === sourceFilter;

    return matchesSearch && matchesStatut && matchesSource;
  });

  const handleNewLeadCreated = () => {
    setShowNewLeadModal(false);
    fetchLeads();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#0F1E3D" }}>
            Leads
          </h1>
          <p className="text-gray-600 mt-1">{filteredLeads.length} lead(s)</p>
        </div>
        <button
          onClick={() => setShowNewLeadModal(true)}
          className="btn btn-gold"
        >
          + Nouveau lead
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Recherche</label>
            <input
              type="text"
              placeholder="Nom, prénom ou téléphone..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Statut</label>
            <select
              className="select w-full"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(STATUT_LEAD_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Source</label>
            <select
              className="select w-full"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">Toutes les sources</option>
              {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatutFilter("");
                setSourceFilter("");
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
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun lead trouvé</div>
        ) : (
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
                {filteredLeads.map((lead) => {
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
                        <span className="badge badge-gold text-xs">
                          {lead.offreDemandee
                            ? OFFRE_LABELS[lead.offreDemandee] ||
                              lead.offreDemandee
                            : "—"}
                        </span>
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
        )}
      </div>

      {/* Modal for new lead */}
      {showNewLeadModal && (
        <NewLeadModal
          onClose={() => setShowNewLeadModal(false)}
          onSuccess={handleNewLeadCreated}
        />
      )}
    </div>
  );
}
