// src/components/SubjectForm.jsx
// -------------------------------------------------------
// Formulario para crear o editar Asignaturas.
// Permite agregar un nombre, descripción, horarios dinámicos
// (hasta 7 días) y elegir un degradado visual.
// -------------------------------------------------------

import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import Modal from "./Modal";

export const GRADIENTS = [
  { id: "purple", colors: ["#a855f7", "#7c3aed"] },
  { id: "blue", colors: ["#3b82f6", "#2563eb"] },
  { id: "pink", colors: ["#ec4899", "#e11d48"] },
  { id: "orange", colors: ["#f59e0b", "#ea580c"] },
  { id: "green", colors: ["#10b981", "#059669"] },
  { id: "teal", colors: ["#14b8a6", "#0d9488"] },
];

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function SubjectForm({ isOpen, onClose, user, subjectToEdit = null }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("activa");
  const [colorId, setColorId] = useState("purple");
  const [horarios, setHorarios] = useState([]); // { id, dia, inicio, fin }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Llenar datos si editamos
  useEffect(() => {
    if (subjectToEdit) {
      setNombre(subjectToEdit.nombre || "");
      setDescripcion(subjectToEdit.descripcion || "");
      setEstado(subjectToEdit.estado || "activa");
      setColorId(subjectToEdit.colorId || "purple");
      setHorarios(subjectToEdit.horarios || []);
      
      // Compatibilidad hacia atrás si la asignatura vieja tenía "horario" (string) y no "horarios" (array)
      if (!subjectToEdit.horarios && subjectToEdit.horario) {
        setDescripcion((prev) => prev ? `${prev}\nHorario original: ${subjectToEdit.horario}` : `Horario original: ${subjectToEdit.horario}`);
      }
    } else {
      setNombre("");
      setDescripcion("");
      setEstado("activa");
      setColorId("purple");
      setHorarios([]);
    }
  }, [subjectToEdit, isOpen]);

  const addHorario = () => {
    if (horarios.length >= 7) return;
    setHorarios([
      ...horarios,
      { id: Date.now().toString(), dia: "Lunes", inicio: "08:00", fin: "10:00" },
    ]);
  };

  const removeHorario = (id) => {
    setHorarios(horarios.filter((h) => h.id !== id));
  };

  const updateHorario = (id, field, value) => {
    setHorarios(
      horarios.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const subjectData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        estado,
        colorId,
        horarios: horarios.map(({ id, ...rest }) => rest), // Quitar ID temporal
        updatedAt: serverTimestamp(),
      };

      if (subjectToEdit) {
        const ref = doc(db, "users", user.uid, "subjects", subjectToEdit.id);
        await updateDoc(ref, subjectData);
      } else {
        subjectData.createdAt = serverTimestamp();
        const colRef = collection(db, "users", user.uid, "subjects");
        await addDoc(colRef, subjectData);
      }

      onClose();
    } catch (err) {
      console.error("Error guardando asignatura:", err);
      setError("Ocurrió un error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subjectToEdit ? "Editar Asignatura" : "Nueva Asignatura"}
    >
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Nombre de la asignatura *
          </label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Matemáticas Avanzadas"
            maxLength={50}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Descripción (opcional)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. El profesor se llama X. Salón 201."
            className="h-20 resize-none text-sm"
            maxLength={200}
          />
        </div>

        {/* Horarios Dinámicos */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Horarios ({horarios.length}/7)
            </label>
            {horarios.length < 7 && (
              <button
                type="button"
                onClick={addHorario}
                className="text-xs font-bold transition-colors"
                style={{ color: "var(--accent)" }}
              >
                + Agregar Día
              </button>
            )}
          </div>

          {horarios.length === 0 ? (
            <div className="text-xs text-center py-4 rounded-xl border border-dashed" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Sin horarios configurados
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {horarios.map((h) => (
                <div key={h.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "var(--bg-raised)" }}>
                  <select
                    value={h.dia}
                    onChange={(e) => updateHorario(h.id, "dia", e.target.value)}
                    className="flex-1 py-1 px-2 text-xs h-auto min-h-0 bg-transparent border-none p-0 focus:ring-0"
                    style={{ background: "transparent" }}
                  >
                    {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  
                  <input
                    type="time"
                    value={h.inicio}
                    onChange={(e) => updateHorario(h.id, "inicio", e.target.value)}
                    className="w-[70px] py-1 px-1 text-xs h-auto min-h-0 border-none bg-transparent text-center focus:ring-0 color-scheme-dark p-0"
                    style={{ colorScheme: "dark" }}
                    required
                  />
                  <span className="text-xs opacity-50">-</span>
                  <input
                    type="time"
                    value={h.fin}
                    onChange={(e) => updateHorario(h.id, "fin", e.target.value)}
                    className="w-[70px] py-1 px-1 text-xs h-auto min-h-0 border-none bg-transparent text-center focus:ring-0 color-scheme-dark p-0"
                    style={{ colorScheme: "dark" }}
                    required
                  />
                  
                  <button
                    type="button"
                    onClick={() => removeHorario(h.id)}
                    className="text-red-400 hover:text-red-300 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-400/10 transition-colors ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estado y Color alineados */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full text-sm"
            >
              <option value="activa">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="completada">Completada (Bloquea edición)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Color
            </label>
            <div className="flex gap-2 bg-zinc-800/50 p-2 rounded-xl border border-zinc-700/50 overflow-x-auto">
              {GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setColorId(g.id)}
                  className="w-8 h-8 rounded-full shrink-0 relative transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})`,
                    transform: colorId === g.id ? "scale(1.15)" : "scale(1)",
                    border: colorId === g.id ? "2px solid white" : "2px solid transparent",
                    minHeight: "auto",
                    padding: 0,
                  }}
                  aria-label={`Seleccionar color ${g.id}`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !nombre.trim()}
          className="btn-primary mt-4"
        >
          {loading ? "Guardando..." : "Guardar Asignatura"}
        </button>
      </form>
    </Modal>
  );
}
