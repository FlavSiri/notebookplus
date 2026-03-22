import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/config";
import AuthNavbar from "../components/AuthNavbar";

const googleProvider = new GoogleAuthProvider();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "/";
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Email o contraseña incorrectos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "/";
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("No se pudo iniciar sesión con Google.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-up" style={{ background: "var(--bg-base)" }}>
      {/* Navbar mínima para auth */}
      <AuthNavbar />

      {/* Glow decorativo */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: "var(--accent)" }}
      />

      {/* Título centrado debajo de la navbar */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 px-4">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>
          {isRegistering ? "Crea tu cuenta" : "Bienvenido de vuelta"}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          {isRegistering ? "Empieza a organizar tus clases" : "Entra a tu espacio personal"}
        </p>
      </div>

      {/* Panel inferior tipo sheet */}
      <div
        className="relative w-full rounded-t-3xl px-6 pt-6 pb-10"
        style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-light)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
        }}
      >
        {/* Tirador visual */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-6"
          style={{ background: "var(--border)" }}
        />

        {/* Error */}
        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Botón Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="btn-ghost mb-3"
        >
          {/* Icono SVG oficial de Google */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 6.9-10.1 7.1-17z"/>
            <path fill="#FBBC05" d="M10.6 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.1-6z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.5-5.8c-2.1 1.4-4.8 2.3-7.8 2.3-6.1 0-11.3-4.1-13.2-9.7l-8 6.1C6.5 42.5 14.6 48 24 48z"/>
          </svg>
          {googleLoading ? "Conectando..." : "Continuar con Google"}
        </button>

        {/* Divisor */}
        <div className="divider my-4">o con email</div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary mt-1"
          >
            {loading ? "Procesando..." : isRegistering ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
          {isRegistering ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
            className="font-semibold"
            style={{
              minHeight: "auto",
              width: "auto",
              background: "transparent",
              color: "#a78bfa",
              padding: "0",
            }}
          >
            {isRegistering ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
}
