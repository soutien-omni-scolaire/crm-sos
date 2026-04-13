"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  cn,
  STATUT_LEAD_LABELS,
  STATUT_LEAD_COLORS,
  SOURCE_LABELS,
  OFFRE_LABELS,
  PIPELINE_ORDER,
  formatDate,
  isOverdue,
  getLeadScore,
} from "@/lib/utils";
import { Lead } from "@/types";

interface LeadsByStatus {
  [key: string]: Lead[];
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<LeadsByStatus>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const centreIdRef = useRef<string | null>(null);

  const fetchLeads = async (centreId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (centreId) params.append("centreId", centreId);
      const response = await fetch(`/api/leads?${params}`);
      if (!response.ok) throw new Error("Erreur lors du chargement des leads");
      const data = await response.json();
      setLeads(data);
      setError(null);

      // Group leads by status
      const grouped: LeadsByStatus = {};
      PIPELINE_ORDER.forEach((status) => {
        grouped[status] = [];
      });
      data.forEach((lead: Lead) => {
        if (grouped[lead.statut]) {
          grouped[lead.statut].push(lead);
        }
      });
      setLeadsByStatus(grouped);
    } catch (err) {
      console.error("Erreur pipeline:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get centre ID from localStorage
    const centreId = localStorage.getItem("selectedCentreId");
    centreIdRef.current = centreId;
    fetchLeads(centreId || undefined);

    // Listen for centre filter changes
    const handleCentreChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      centreIdRef.current = customEvent.detail;
      fetchLeads(customEvent.detail || undefined);
    };

    window.addEventListener("centreFilterChanged", handleCentreChange);
    return () => {
      window.removeEventListener("centreFilterChanged", handleCentreChange);
    };
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatus }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      // Update local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, statut: newStatus } : lead
        )
      );

      // Regroup leads
      const grouped: LeadsByStatus = {};
      PIPELINE_ORDER.forEach((status) => {
        grouped[status] = [];
      });
      setLeads((prevLeads) => {
        prevLeads.forEach((lead) => {
          if (grouped[lead.statut]) {
            grouped[lead.statut].push(lead);
          }
        });
        setLeadsByStatus(grouped);
        return prevLeads;
      });
    } catch (err) {
      console.error("Erreur changement statut:", err);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Chargement du pipeline...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Gestion des prospects par statut</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
          </div>
        )}

        {/* Kanban Board */}
        <div className="overflow-x-auto flex-1">
          <div className="flex gap-4 sm:gap-6 pb-4 min-h-[600px]">
          {PIPELINE_ORDER.map((status) => {
            const statusLeads = leadsByStatus[status] || [];
            const statusLabel = STATUT_LEAD_LABELS[status] || status;

            // Color mapping for column headers
            const headerColorMap: Record<string, string> = {
              nouveau: "bg-blue-100",
              contacte: "bg-amber-100",
              qualifie: "bg-purple-100",
              en_attente: "bg-orange-100",
              converti: "bg-green-100",
              perdu: "bg-red-100",
            };

            const borderColorMap: Record<string, string> = {
              nouveau: "border-t-blue-500",
              contacte: "border-t-amber-500",
              qualifie: "border-t-purple-500",
              en_attente: "border-t-orange-500",
              converti: "border-t-green-500",
              perdu: "border-t-red-500",
            };

            return (
              <div
                key={status}
                className="flex-shrink-0 w-72 sm:w-80 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex flex-col"
              >
                {/* Column Header */}
                <div
                  className={cn(
                    "px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200 border-t-4",
                    headerColorMap[status],
                    borderColorMap[status]
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {statusLabel}
                    </h3>
                    <span className="bg-gray-300 text-gray-700 text-xs font-medium rounded-full px-2 py-0.5 flex-shrink-0">
                      {statusLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-2 sm:p-3 overflow-y-auto space-y-2 sm:space-y-3 bg-gray-50">
                  {statusLeads.length > 0 ? (
                    statusLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">Aucun prospect</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  onStatusChange,
}: {
  lead: Lead;
  onStatusChange: (leadId: string, newStatus: string) => void;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const score = getLeadScore(lead);

  return (
    <Link href={`/leads/${lead.id}`}>
      <div className="card p-3 bg-white hover:shadow-md transition-shadow cursor-pointer">
        {/* Header with status dropdown */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900">
              {lead.prenomParent} {lead.nomParent || ""}
            </h4>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowStatusMenu(!showStatusMenu);
              }}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H9.5V3H10.5V1.5ZM5.03033 2.96967L5.74744 3.68678L6.45455 2.96967L5.73744 2.25256L5.03033 2.96967ZM14.9697 14.9697L14.2526 14.2526L14.9697 13.5355L15.6868 14.2526L14.9697 14.9697ZM14.9697 2.96967L14.2526 2.25256L13.5355 2.96967L14.2526 3.68678L14.9697 2.96967ZM5.03033 14.9697L5.74744 15.6868L6.45455 14.9697L5.73744 14.2526L5.03033 14.9697Z" />
              </svg>
            </button>
            {showStatusMenu && (
              <div
                className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {PIPELINE_ORDER.map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onStatusChange(lead.id, status);
                      setShowStatusMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-gray-50",
                      lead.statut === status && "bg-blue-50"
                    )}
                  >
                    {STATUT_LEAD_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Telephone */}
        <p className="text-xs text-gray-500 mb-2">{lead.telephone}</p>

        {/* Source badge */}
        {lead.source && (
          <div className="mb-2">
            <span className="badge badge-blue text-xs">
              {SOURCE_LABELS[lead.source] || lead.source}
            </span>
          </div>
        )}

        {/* Offre demandée badge */}
        {lead.offreDemandee && (
          <div className="mb-2">
            <span className="badge badge-gold text-xs">
              {lead.offreDemandee}
            </span>
          </div>
        )}

        {/* Score dots */}
        <div className="mb-2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i < Math.round(score) ? "score-dot-filled" : "score-dot-empty"
              )}
            />
          ))}
        </div>

        {/* Date prochaine relance */}
        {lead.dateProchaineRelance && (
          <div
            className={cn(
              "text-xs p-1.5 rounded",
              isOverdue(lead.dateProchaineRelance)
                ? "bg-red-50 text-red-700 font-medium"
                : "text-gray-600"
            )}
          >
            Relance: {formatDate(lead.dateProchaineRelance)}
          </div>
        )}
      </div>
    </Link>
  );
}
