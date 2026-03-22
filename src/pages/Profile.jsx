// src/pages/Profile.jsx
// -------------------------------------------------------
// Página de perfil: el usuario puede guardar su nombre y edad.
// Los datos se leen y guardan en Firestore (colección "users").
// -------------------------------------------------------

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Cargar datos existentes de Firestore al montar
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setNombre(data.nombre || "");
          setEdad(data.edad?.toString() || "");
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Redirigir si no está logueado
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, authLoading]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      // 1. Guardar en Firestore (colección "users", documento con el UID del usuario)
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          nombre: nombre.trim(),
          edad: edad ? parseInt(edad, 10) : null,
          email: user.email,
          updatedAt: new Date(),
        },
        { merge: true } // merge:true para no borrar otros campos
      );

      // 2. Actualizar displayName en Firebase Auth (aparece en la Navbar)
      await updateProfile(auth.currentUser, {
        displayName: nombre.trim(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="page">
        <Navbar />
        <div className="flex items-center justify-center flex-1" style={{ minHeight: "80vh" }}>
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      <main className="px-5 py-8 max-w-sm mx-auto w-full animate-fade-up">
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--bg-raised)",
              color: "var(--text-secondary)",
              minHeight: "auto",
              width: "2.25rem",
              padding: 0,
            }}
          >
            ←
          </button>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Mi perfil
          </h1>
        </div>

        {/* Avatar grande */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold mb-3"
            style={{
              background: "var(--accent-light)",
              color: "#a78bfa",
              border: "2px solid rgba(124,58,237,0.3)",
            }}
          >
            {nombre?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {user?.email}
          </p>
        </div>

        {/* Mensajes de estado */}
        {success && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
            style={{
              background: "rgba(34,197,94,0.1)",
              color: "#4ade80",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            ✅ Perfil guardado correctamente
          </div>
        )}
        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. María García"
              maxLength={60}
              autoComplete="name"
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Edad
            </label>
            <input
              type="number"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              placeholder="Ej. 25"
              min={1}
              max={120}
              inputMode="numeric"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-2"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {/* Info de Firestore para el dev */}
        <p
          className="text-xs text-center mt-8"
          style={{ color: "var(--text-muted)" }}
        >
          Los datos se guardan en{" "}
          <span style={{ color: "#a78bfa" }}>Firestore → users / {user?.uid?.slice(0, 8)}…</span>
        </p>
      </main>
    </div>
  );
}
