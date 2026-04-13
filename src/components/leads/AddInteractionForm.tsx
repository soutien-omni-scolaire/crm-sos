"use client";

import { useState } from "react";
import { TYPE_INTERACTION_LABELS } from "@/lib/utils";

interface AddInteractionFormProps {
  leadId?: string;
  familleId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddInteractionForm({
  leadId,
  familleId,
  onClose,
  onSuccess,
}: AddInteractionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "appel",
    resume: "",
    prochaineAction: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resume.trim()) {
      alert("Veuillez remplir le résumé de l'interaction");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          leadId: leadId || null,
          familleId: familleId || null,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert("Erreur lors de la création de l'interaction");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création de l'interaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md w-full">
        <div className="modal-header">
          <h2 className="text-xl font-bold text-white">
            Ajouter une interaction
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Type d'interaction</label>
            <select
              className="select w-full"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              {Object.entries(TYPE_INTERACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Résumé</label>
            <textarea
              className="input w-full"
              value={formData.resume}
              onChange={(e) =>
                setFormData({ ...formData, resume: e.target.value })
              }
              placeholder="Décrivez l'interaction..."
              rows={4}
            />
          </div>

          <div>
            <label className="label">Prochaine action</label>
            <input
              type="text"
              className="input w-full"
              value={formData.prochaineAction}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prochaineAction: e.target.value,
                })
              }
              placeholder="Ex: Appeler demain à 10h"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold flex-1"
            >
              {loading ? "Création..." : "Ajouter"}
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
