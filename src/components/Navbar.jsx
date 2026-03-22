// src/components/Navbar.jsx — Dropdown en avatar, logo configurable

import { useState, useRef, useEffect } from "react";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await signOut(auth);
  };

  const goToProfile = () => {
    setOpen(false);
    window.location.href = "/perfil";
  };

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-light)",
        paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <a href="/" className="flex items-center gap-2.5">
        {/*
          LOGO: Para usar tu propia imagen, coloca el archivo en:
            public/logo.png   (o .svg, .webp, etc.)
          Luego descomenta la línea de <img> y comenta el <span> del emoji.
        */}
        {/* <img src="/logo.png" alt="NotebookPlus" className="h-7 w-auto" /> */}
        <span className="text-xl">📔</span>
        <span className="font-bold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
          NotebookPlus
        </span>
      </a>

      {/* ── Avatar con Dropdown ─── */}
      {user && (
        <div className="relative" ref={dropdownRef}>
          {/* Avatar — botón que abre el dropdown */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú de usuario"
            aria-expanded={open}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={{
              background: open ? "var(--accent)" : "var(--accent-light)",
              color: open ? "#fff" : "#a78bfa",
              minHeight: "auto",
              width: "2.25rem",
              padding: 0,
              border: "2px solid",
              borderColor: open ? "var(--accent)" : "transparent",
            }}
          >
            {user.email?.[0]?.toUpperCase() ?? "U"}
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-2xl shadow-xl overflow-hidden"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                top: "100%",
              }}
            >
              {/* Info del usuario */}
              <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "var(--border-light)" }}>
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {user.displayName || "Sin nombre"}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {user.email}
                </p>
              </div>

              {/* Opciones */}
              <button
                onClick={goToProfile}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors"
                style={{
                  color: "var(--text-secondary)",
                  background: "transparent",
                  borderRadius: 0,
                  minHeight: "auto",
                  justifyContent: "flex-start",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span>👤</span> Mi perfil
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors"
                style={{
                  color: "#f87171",
                  background: "transparent",
                  borderRadius: 0,
                  minHeight: "auto",
                  justifyContent: "flex-start",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span>🚪</span> Salir
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
