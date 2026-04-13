"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Centre } from "@/types";

export function Header() {
  const pathname = usePathname();
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentres, setSelectedCentres] = useState<string[]>(["all"]);

  useEffect(() => {
    fetch("/api/centres")
      .then((r) => r.json())
      .then((data) => setCentres(data))
      .catch(() => {});
  }, []);

  // Store centre filter globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedCentres.includes("all") || selectedCentres.length === 0) {
        (window as any).__centreFilter = null;
      } else {
        (window as any).__centreFilter = selectedCentres;
      }
      window.dispatchEvent(new CustomEvent("centreFilterChanged"));
    }
  }, [selectedCentres]);

  const handleCentreClick = (centreId: string) => {
    if (centreId === "all") {
      setSelectedCentres(["all"]);
    } else {
      setSelectedCentres((prev) => {
        const newSelection = prev.filter((id) => id !== "all");
        if (newSelection.includes(centreId)) {
          return newSelection.filter((id) => id !== centreId);
        } else {
          return [...newSelection, centreId];
        }
      });
    }
  };

  const getPageTitle = (path: string): string => {
    if (path === "/") return "Tableau de bord";
    if (path.startsWith("/leads")) return "Leads";
    if (path.startsWith("/familles")) return "Familles";
    if (path.startsWith("/taches")) return "Tâches";
    if (path.startsWith("/pipeline")) return "Pipeline";
    if (path.startsWith("/campagnes")) return "Campagnes";
    if (path.startsWith("/analytique")) return "Analytique";
    if (path.startsWith("/ambassadeurs")) return "Ambassadeurs";
    return "CRM SOS";
  };

  const centresShortNames = [
    { id: "all", code: "Tous" },
    { id: "LAU", code: "Lausanne" },
    { id: "VEV", code: "Vevey" },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-7">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold" style={{ color: "#0F1E3D" }}>
          {getPageTitle(pathname)}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Centre Filter */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#6B7280" }}
          >
            Filtrer par centre
          </span>
          <div className="flex gap-1.5">
            {centresShortNames.map((centre) => (
              <button
                key={centre.id}
                onClick={() => handleCentreClick(centre.id)}
                className={cn(
                  "centre-btn transition-all",
                  selectedCentres.includes(centre.id) && "centre-btn-active"
                )}
              >
                {centre.code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

const cn = (...classes: (string | false | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};
