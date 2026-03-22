// src/components/AuthNavbar.jsx
// -------------------------------------------------------
// Navbar minimalista para páginas de Login/Register.
// Solo muestra logo + nombre, sin opciones de usuario.
// -------------------------------------------------------

export default function AuthNavbar() {
  return (
    <header
      className="flex items-center justify-center px-4 py-4"
      style={{
        background: "transparent",
        paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
      }}
    >
      <a href="/" className="flex items-center gap-2.5">
        <span className="text-xl">📔</span>
        <span className="font-bold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
          NotebookPlus
        </span>
      </a>
    </header>
  );
}
