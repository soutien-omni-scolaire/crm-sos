"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Mot de passe incorrect");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0F1E3D 0%, #1B3568 50%, #0F1E3D 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ border: "3px solid #C9A84C", backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <img
              src="/logo.png"
              alt="SOS"
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Soutien Omni Scolaire
          </h1>
          <p className="text-sm mt-2" style={{ color: "#7B9BC4" }}>
            CRM — Machine Commerciale
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Connexion
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Entrez le mot de passe pour accéder au CRM
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="label">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#7B9BC4" }}>
          Accès réservé aux collaborateurs SOS
        </p>
      </div>
    </div>
  );
}
