// src/components/ReminderForm.jsx
// -------------------------------------------------------
// Formulario para crear Recordatorios (Notas de texto o imágenes)
// -------------------------------------------------------

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadImageToImgBB } from "../lib/imgbb";
import Modal from "./Modal";

export default function ReminderForm({ isOpen, onClose, user, subjectId }) {
  const [tipo, setTipo] = useState("nota"); // "nota" | "imagen"
  const [contenidoNota, setContenidoNota] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !subjectId) return;

    if (tipo === "nota" && !contenidoNota.trim()) {
      return setError("Escribe una nota.");
    }
    if (tipo === "imagen" && !selectedFile) {
      return setError("Selecciona una imagen.");
    }

    setError("");
    setLoading(true);

    try {
      let contenidoFinal = contenidoNota.trim();

      // Si es imagen, subir a ImgBB primero
      if (tipo === "imagen") {
        contenidoFinal = await uploadImageToImgBB(selectedFile);
      }

      const reminderData = {
        tipo,
        contenido: contenidoFinal,
        createdAt: serverTimestamp(),
      };

      const colRef = collection(db, "users", user.uid, "subjects", subjectId, "reminders");
      await addDoc(colRef, reminderData);

      // Limpiar y cerrar
      setTipo("nota");
      setContenidoNota("");
      setSelectedFile(null);
      onClose();
    } catch (err) {
      console.error("Error guardando recordatorio:", err);
      setError(err.message || "Error al guardar el recordatorio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Recordatorio">
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2">
        {/* Tipo de recordatorio */}
        <div className="flex bg-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTipo("nota")}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
              tipo === "nota" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            }`}
          >
            📝 Nota
          </button>
          <button
            type="button"
            onClick={() => setTipo("imagen")}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
              tipo === "imagen" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            }`}
          >
            📸 Imagen
          </button>
        </div>

        {/* Input dinámico basado en el tipo */}
        {tipo === "nota" ? (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Contenido de la nota
            </label>
            <textarea
              required
              value={contenidoNota}
              onChange={(e) => setContenidoNota(e.target.value)}
              placeholder="Escribe tus apuntes aquí..."
              className="resize-none h-32"
              maxLength={500}
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Selecciona una imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
            />
            {selectedFile && <p className="text-xs text-green-400 mt-2">Imagen seleccionada: {selectedFile.name}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (tipo === "nota" && !contenidoNota.trim()) || (tipo === "imagen" && !selectedFile)}
          className="btn-primary mt-4"
        >
          {loading ? "Guardando..." : "Guardar Recordatorio"}
        </button>
      </form>
    </Modal>
  );
}
