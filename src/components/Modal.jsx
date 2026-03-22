// src/components/Modal.jsx
// -------------------------------------------------------
// Componente Modal reutilizable, con animación bottom-sheet.
// Ideal para móvil (se ancla abajo) pero se ve bien en desktop.
// -------------------------------------------------------

import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  // Evitar scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center">
      {/* ── Overlay (Fondo oscuro) ───────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Contenedor Modal (Bottom Sheet en móvil) ──────── */}
      <div
        className="relative w-full sm:max-w-md w-full rounded-t-3xl sm:rounded-3xl animate-fade-up max-h-[90vh] flex flex-col shadow-2xl"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-light)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Tirador visual (solo diseño) */}
        <div className="w-10 h-1.5 rounded-full mx-auto mt-4 mb-2 sm:hidden" style={{ background: "var(--border)" }} />

        {/* ── Header ───────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-light)" }}>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "var(--bg-raised)",
              color: "var(--text-secondary)",
              minHeight: "auto",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ───────────────────────────────────── */}
        <div className="px-6 py-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
