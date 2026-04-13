"use client";

import { useEffect, useState } from "react";
import { OFFRE_CODES } from "@/lib/utils";
import { Lead, Centre } from "@/types";

interface Eleve {
  prenom: string;
  nom: string;
  niveauScolaire: string;
  ecole: string;
  inscription: {
    typeOffre: string;
    formule: string;
    matieres: string;
    dateDebut: string;
  };
}

interface ConvertLeadModalProps {
  lead: Lead;
  onClose: () => void;
  onSuccess: (familleId: string) => void;
}

export function ConvertLeadModal({
  lead,
  onClose,
  onSuccess,
}: ConvertLeadModalProps) {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(false);
  const [eleves, setEleves] = useState<Eleve[]>([
    {
      prenom: "",
      nom: lead.nomParent || "",
      niveauScolaire: lead.niveauScolaire || "",
      ecole: "",
      inscription: {
        typeOffre: lead.offreDemandee || "",
        formule: "",
        matieres: lead.matiereDemandee || "",
        dateDebut: new Date().toISOString().split("T")[0],
      },
    },
  ]);

  const [formData, setFormData] = useState({
    prenomParent: lead.prenomParent,
    nomParent: lead.nomParent || "",
    telephone: lead.telephone,
    email: lead.email || "",
    centrePrincipalId: lead.centreId,
    commentaire: lead.commentaire || "",
  });

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const response = await fetch("/api/centres");
        const data = await response.json();
        setCentres(data);
      } catch (error) {
        console.error("Erreur lors du chargement des centres:", error);
      }
    };
    fetchCentres();
  }, []);

  const addEleve = () => {
    setEleves([
      ...eleves,
      {
        prenom: "",
        nom: formData.nomParent,
        niveauScolaire: "",
        ecole: "",
        inscription: {
          typeOffre: "",
          formule: "",
          matieres: "",
          dateDebut: new Date().toISOString().split("T")[0],
        },
      },
    ]);
  };

  const removeEleve = (index: number) => {
    setEleves(eleves.filter((_, i) => i !== index));
  };

  const updateEleve = (
    index: number,
    field: string,
    value: string | { typeOffre?: string; formule?: string; matieres?: string; dateDebut?: string }
  ) => {
    const updated = [...eleves];
    if (typeof value === "string") {
      (updated[index] as any)[field] = value;
    } else {
      updated[index].inscription = { ...updated[index].inscription, ...value };
    }
    setEleves(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomParent.trim()) {
      alert("Le nom du parent est obligatoire");
      return;
    }

    if (eleves.some((e) => !e.prenom.trim() || !e.inscription.typeOffre)) {
      alert("Veuillez remplir les informations de tous les élèves");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eleves: eleves.map((e) => ({
            prenom: e.prenom,
            nom: e.nom,
            niveauScolaire: e.niveauScolaire,
            ecole: e.ecole,
            centreId: formData.centrePrincipalId,
            inscription: e.inscription,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.familleId);
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la conversion");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la conversion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl w-full my-8 overflow-y-auto">
        <div className="modal-header">
          <h2 className="text-xl font-bold text-white">Convertir en client</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section informations parent */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Informations du parent
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Prénom</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.prenomParent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prenomParent: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <div>
                  <label className="label">Nom *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.nomParent}
                    onChange={(e) =>
                      setFormData({ ...formData, nomParent: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Téléphone</label>
                  <input
                    type="tel"
                    className="input w-full"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                    disabled
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
                  />
                </div>
              </div>

              <div>
                <label className="label">Centre principal</label>
                <select
                  className="select w-full"
                  value={formData.centrePrincipalId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      centrePrincipalId: e.target.value,
                    })
                  }
                >
                  {centres.map((centre) => (
                    <option key={centre.id} value={centre.id}>
                      {centre.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Commentaire</label>
                <textarea
                  className="input w-full"
                  value={formData.commentaire}
                  onChange={(e) =>
                    setFormData({ ...formData, commentaire: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Section élèves */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Élèves</h3>
            <div className="space-y-6">
              {eleves.map((eleve, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Élève {index + 1}
                    </h4>
                    {eleves.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEleve(index)}
                        className="btn btn-sm btn-secondary"
                      >
                        Retirer
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Prénom *</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={eleve.prenom}
                        onChange={(e) =>
                          updateEleve(index, "prenom", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Nom</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={eleve.nom}
                        onChange={(e) =>
                          updateEleve(index, "nom", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Niveau scolaire</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={eleve.niveauScolaire}
                        onChange={(e) =>
                          updateEleve(index, "niveauScolaire", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="label">École</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={eleve.ecole}
                        onChange={(e) =>
                          updateEleve(index, "ecole", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Inscription */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <h5 className="font-medium text-gray-900">Inscription</h5>

                    <div>
                      <label className="label">Type d'offre *</label>
                      <select
                        className="select w-full"
                        value={eleve.inscription.typeOffre}
                        onChange={(e) =>
                          updateEleve(index, "inscription", {
                            typeOffre: e.target.value,
                            formule: eleve.inscription.formule,
                            matieres: eleve.inscription.matieres,
                            dateDebut: eleve.inscription.dateDebut,
                          })
                        }
                      >
                        <option value="">Sélectionner une offre</option>
                        {OFFRE_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Formule</label>
                        <input
                          type="text"
                          className="input w-full"
                          value={eleve.inscription.formule}
                          onChange={(e) =>
                            updateEleve(index, "inscription", {
                              typeOffre: eleve.inscription.typeOffre,
                              formule: e.target.value,
                              matieres: eleve.inscription.matieres,
                              dateDebut: eleve.inscription.dateDebut,
                            })
                          }
                          placeholder="Ex: 2h/semaine"
                        />
                      </div>
                      <div>
                        <label className="label">Matières</label>
                        <input
                          type="text"
                          className="input w-full"
                          value={eleve.inscription.matieres}
                          onChange={(e) =>
                            updateEleve(index, "inscription", {
                              typeOffre: eleve.inscription.typeOffre,
                              formule: eleve.inscription.formule,
                              matieres: e.target.value,
                              dateDebut: eleve.inscription.dateDebut,
                            })
                          }
                          placeholder="Mathématiques, Français..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Date de début *</label>
                      <input
                        type="date"
                        className="input w-full"
                        value={eleve.inscription.dateDebut}
                        onChange={(e) =>
                          updateEleve(index, "inscription", {
                            typeOffre: eleve.inscription.typeOffre,
                            formule: eleve.inscription.formule,
                            matieres: eleve.inscription.matieres,
                            dateDebut: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEleve}
              className="btn btn-secondary w-full mt-4"
            >
              + Ajouter un élève
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gold flex-1"
            >
              {loading ? "Conversion..." : "Convertir"}
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
