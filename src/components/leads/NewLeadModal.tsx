"use client";

import { useEffect, useState } from "react";
import { SOURCE_LABELS, OFFRE_LABELS } from "@/lib/utils";
import { Centre } from "@/types";

interface NewLeadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NewLeadModal({ onClose, onSuccess }: NewLeadModalProps) {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenomParent: "",
    nomParent: "",
    telephone: "",
    email: "",
    source: "site_web",
    centreId: "",
    niveauScolaire: "",
    matiereDemandee: "",
    offreDemandee: "",
    nombreEnfants: "",
    commentaire: "",
  });

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const response = await fetch("/api/centres");
        const data = await response.json();
        setCentres(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, centreId: data[0].id }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des centres:", error);
      }
    };
    fetchCentres();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prenomParent.trim() || !formData.telephone.trim()) {
      alert("Veuillez remplir les champs obligatoires (Prénom et Téléphone)");
      return;
    }

    if (!formData.centreId) {
      alert("Veuillez sélectionner un centre");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nombreEnfants: formData.nombreEnfants
            ? parseInt(formData.nombreEnfants)
            : 1,
          creeParId: "default-user-id",
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert("Erreur lors de la création du lead");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création du lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay visible">
      <div className="modal">
        <div className="modal-header">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
            />
          </svg>
          <span>Nouveau lead</span>
          <button
            onClick={onClose}
            className="ml-auto text-white hover:opacity-80 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom *</label>
              <input
                type="text"
                className="input w-full"
                value={formData.prenomParent}
                onChange={(e) =>
                  setFormData({ ...formData, prenomParent: e.target.value })
                }
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="label">Nom</label>
              <input
                type="text"
                className="input w-full"
                value={formData.nomParent}
                onChange={(e) =>
                  setFormData({ ...formData, nomParent: e.target.value })
                }
                placeholder="Dupont"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Téléphone *</label>
              <input
                type="tel"
                className="input w-full"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                placeholder="079 123 45 67"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input w-full"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="jean@example.com"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Source *</label>
              <select
                className="select w-full"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
              >
                {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Centre *</label>
              <select
                className="select w-full"
                value={formData.centreId}
                onChange={(e) =>
                  setFormData({ ...formData, centreId: e.target.value })
                }
              >
                <option value="">Sélectionner...</option>
                {centres.map((centre) => (
                  <option key={centre.id} value={centre.id}>
                    {centre.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Niveau scolaire</label>
              <input
                type="text"
                className="input w-full"
                value={formData.niveauScolaire}
                onChange={(e) =>
                  setFormData({ ...formData, niveauScolaire: e.target.value })
                }
                placeholder="6e, 3e, 1re..."
              />
            </div>
            <div>
              <label className="label">Matière demandée</label>
              <input
                type="text"
                className="input w-full"
                value={formData.matiereDemandee}
                onChange={(e) =>
                  setFormData({ ...formData, matiereDemandee: e.target.value })
                }
                placeholder="Mathématiques..."
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Offre demandée</label>
              <select
                className="select w-full"
                value={formData.offreDemandee}
                onChange={(e) =>
                  setFormData({ ...formData, offreDemandee: e.target.value })
                }
              >
                <option value="">Non précisé</option>
                {Object.entries(OFFRE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nombre d'enfants</label>
              <input
                type="number"
                className="input w-full"
                value={formData.nombreEnfants}
                onChange={(e) =>
                  setFormData({ ...formData, nombreEnfants: e.target.value })
                }
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="label">Commentaire</label>
            <textarea
              className="input w-full"
              value={formData.commentaire}
              onChange={(e) =>
                setFormData({ ...formData, commentaire: e.target.value })
              }
              placeholder="Informations supplémentaires..."
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold flex-1"
            >
              {loading ? "Création..." : "Créer le lead"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
