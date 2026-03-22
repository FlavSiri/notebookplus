// src/components/TaskForm.jsx
// -------------------------------------------------------
// Formulario para crear tareas dentro de una asignatura
// -------------------------------------------------------

import { useState } from "react";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Modal from "./Modal";

export default function TaskForm({ isOpen, onClose, user, subjectId, taskToEdit = null }) {
  const [titulo, setTitulo] = useState(taskToEdit?.titulo || "");
  const [fechaStr, setFechaStr] = useState(
    taskToEdit?.fechaVencimiento
      ? new Date(taskToEdit.fechaVencimiento.toDate().getTime() - taskToEdit.fechaVencimiento.toDate().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !subjectId) return;
    if (!titulo.trim()) return setError("El título es obligatorio.");

    setError("");
    setLoading(true);

    try {
      const taskData = {
        titulo: titulo.trim(),
        estado: taskToEdit ? taskToEdit.estado : "pendiente",
        // Convertir string de fecha a objeto Date en formato ISO si existe
        fechaVencimiento: fechaStr ? new Date(fechaStr) : null,
        updatedAt: serverTimestamp(),
      };

      if (taskToEdit) {
        const ref = doc(db, "users", user.uid, "subjects", subjectId, "tasks", taskToEdit.id);
        await updateDoc(ref, taskData);
      } else {
        taskData.createdAt = serverTimestamp();
        const colRef = collection(db, "users", user.uid, "subjects", subjectId, "tasks");
        await addDoc(colRef, taskData);
      }

      setTitulo("");
      setFechaStr("");
      onClose();
    } catch (err) {
      console.error("Error guardando tarea:", err);
      setError("No se pudo guardar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Editar Tarea" : "Nueva Tarea"}
    >
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-xl mb-4">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2">
        {/* Título de la tarea */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            ¿Qué hay que hacer?
          </label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Leer capítulo 4"
            maxLength={100}
          />
        </div>

        {/* Fecha y hora límite (opcional) */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Fecha de vencimiento (opcional)
          </label>
          <input
            type="datetime-local"
            value={fechaStr}
            onChange={(e) => setFechaStr(e.target.value)}
            className="w-full"
            style={{ colorScheme: "dark" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !titulo.trim()}
          className="btn-primary mt-4"
        >
          {loading ? "Guardando..." : "Guardar Tarea"}
        </button>
      </form>
    </Modal>
  );
}
