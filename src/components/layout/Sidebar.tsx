"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navigation = [
  {
    section: "COMMERCIAL",
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
        ),
      },
      {
        name: "Leads",
        href: "/leads",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        ),
      },
      {
        name: "Pipeline",
        href: "/pipeline",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "CLIENTS",
    items: [
      {
        name: "Familles",
        href: "/familles",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "SUIVI",
    items: [
      {
        name: "Tâches",
        href: "/taches",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "STRATÉGIE",
    items: [
      {
        name: "Campagnes",
        href: "/campagnes",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0-3m0 3a1.5 1.5 0 0 0 0-3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0-3m0 3a1.5 1.5 0 0 0 0-3m0 3.75V16.5M9 6.75h6M9 16.5h6" />
          </svg>
        ),
      },
      {
        name: "Analytique",
        href: "/analytique",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 12.75h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 8.625 19.875v-6.75c0-.621.504-1.125 1.125-1.125Zm9-1.5h2.25A1.125 1.125 0 0 1 22 12.75v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V12.75c0-.621.504-1.125 1.125-1.125Z" />
          </svg>
        ),
      },
      {
        name: "Ambassadeurs",
        href: "/ambassadeurs",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        ),
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const sidebarClasses = isMobile
    ? `fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : "hidden lg:flex w-64 flex-col";

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#0F1E3D">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn("flex flex-col", sidebarClasses)} style={{ backgroundColor: "#0F1E3D" }}>
      {/* Logo + Brand Section */}
      <div className="border-b border-opacity-10 border-white px-5 py-5">
        <div className="flex items-center gap-3 mb-2">
          {/* Logo — remplacer /logo.png par ton vrai logo */}
          <img
            src="/logo.png"
            alt="SOS"
            className="h-11 w-11 rounded-full object-cover"
            style={{ border: "2px solid #C9A84C" }}
            onError={(e) => {
              // Fallback si le logo n'est pas encore ajouté
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div
            className="h-11 w-11 items-center justify-center rounded-full font-bold text-xs"
            style={{
              display: "none",
              backgroundColor: "#0F1E3D",
              border: "2px solid #C9A84C",
              color: "#C9A84C",
            }}
          >
            SOS
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              Soutien-Omni-Scolaire
            </div>
          </div>
        </div>
        <div className="mt-2 pl-1">
          <p className="text-xs" style={{ color: "#7B9BC4" }}>
            CRM — Machine Commerciale
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-8 px-4">
        {navigation.map((section) => (
          <div key={section.section}>
            <div
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: "#7B9BC4" }}
            >
              {section.section}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    )}
                    style={
                      isActive
                        ? {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          }
                        : {}
                    }
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div
                        className="w-1 h-6 rounded-l"
                        style={{ backgroundColor: "#C9A84C" }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — Infos entreprise */}
      <div
        className="border-t px-5 py-4 space-y-3"
        style={{ borderTopColor: "rgba(255, 255, 255, 0.1)" }}
      >
        {/* Utilisateur connecté */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs text-white"
            style={{
              backgroundColor: "#152952",
              border: "2px solid #C9A84C",
            }}
          >
            IC
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              Ibrahim Camara
            </p>
            <p className="text-xs truncate" style={{ color: "#C9A84C" }}>
              Fondateur & CEO
            </p>
          </div>
        </div>

        {/* Infos entreprise */}
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        >
          <p className="text-xs font-medium text-white">
            Soutien Omni Scolaire
          </p>
          <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
            2 centres + domicile — Suisse romande
          </p>
          <a
            href="https://soutien-omni-scolaire.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-1 block hover:underline"
            style={{ color: "#C9A84C" }}
          >
            soutien-omni-scolaire.ch
          </a>
          <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
            contact@soutien-omni-scolaire.ch
          </p>
        </div>

        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-white/10"
          style={{ color: "#9CA3AF" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Déconnexion
        </button>
      </div>
      </div>
    </>
  );
}
