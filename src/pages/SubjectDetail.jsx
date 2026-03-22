// src/pages/SubjectDetail.jsx
// -------------------------------------------------------
// Detalles de una asignatura (Tareas y Recordatorios).
// Usa el ID de la url: /asignatura/{subjectId}
// Permite editar, eliminar y previsualizar imágenes.
// -------------------------------------------------------

import { useState, useEffect, useRef } from "react";
import { doc, collection, onSnapshot, query, orderBy, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import ReminderForm from "../components/ReminderForm";
import SubjectForm, { GRADIENTS } from "../components/SubjectForm";
import ImageModal from "../components/ImageModal";

// Retorna el estilo del degradado
const getGradientStyle = (colorId) => {
  const g = GRADIENTS.find((c) => c.id === colorId) || GRADIENTS[0];
  return { background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` };
};

export default function SubjectDetail() {
  const { user, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  
  const [activeTab, setActiveTab] = useState("tareas");
  
  // Modales
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  
  // Modal de imagen
  const [selectedImage, setSelectedImage] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const isDeletingRef = useRef(false);

  // Extraer ID
  const pathParts = window.location.pathname.split("/");
  const subjectId = pathParts[pathParts.length - 1];

  useEffect(() => {
    if (!user || !subjectId) return;

    // 1. Escuchar la Asignatura
    const subRef = doc(db, "users", user.uid, "subjects", subjectId);
    const unsubSub = onSnapshot(subRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.estado === "eliminada" && !isDeletingRef.current) {
          window.location.replace("/"); // Si está "eliminada" ocultamente, no puede entrar
        } else {
          setSubject({ id: docSnap.id, ...data });
        }
      } else if (!isDeletingRef.current) {
        window.location.replace("/"); // fue eliminada duro o no existe
      }
    });

    // 2. Escuchar Tareas
    const tasksQuery = query(
      collection(db, "users", user.uid, "subjects", subjectId, "tasks"),
      orderBy("createdAt", "desc")
    );
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Escuchar Recordatorios
    const remQuery = query(
      collection(db, "users", user.uid, "subjects", subjectId, "reminders"),
      orderBy("createdAt", "desc")
    );
    const unsubReminders = onSnapshot(remQuery, (snap) => {
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingData(false);
    });

    return () => { unsubSub(); unsubTasks(); unsubReminders(); };
  }, [user, subjectId]);

  if (authLoading || loadingData) {
    return (
      <div className="page">
        <Navbar />
        <div className="flex items-center justify-center flex-1" style={{ minHeight: "80vh" }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)" }} />
        </div>
      </div>
    );
  }

  const isCompleted = subject?.estado === "completada";

  // Marcar tarea
  const toggleTaskStatus = async (task) => {
    if (isCompleted) return; // Bloqueado si está terminada
    let nextStatus = "completada";
    if (task.estado === "pendiente") nextStatus = "completada";
    else if (task.estado === "completada") nextStatus = "fallida";
    else nextStatus = "pendiente";

    const ref = doc(db, "users", user.uid, "subjects", subjectId, "tasks", task.id);
    await updateDoc(ref, { estado: nextStatus });
  };

  // Eliminar recordatorio
  const deleteReminder = async (remId) => {
    if (window.confirm("¿Seguro que deseas eliminar este recordatorio?")) {
      const ref = doc(db, "users", user.uid, "subjects", subjectId, "reminders", remId);
      await deleteDoc(ref);
    }
  };

  // Ocultar asignatura completa (Soft Delete)
  const deleteSubject = async () => {
    if (window.confirm("¿Estás 100% seguro de querer eliminar esta asignatura? Desaparecerá de tu panel principal.")) {
      try {
        isDeletingRef.current = true; // Bloquea el redirect temprano del onSnapshot
        const ref = doc(db, "users", user.uid, "subjects", subjectId);
        // Hacemos Soft Delete cambiando el estado a "eliminada"
        await updateDoc(ref, { estado: "eliminada" });
        window.location.replace("/"); 
      } catch (error) {
        isDeletingRef.current = false;
        console.error("Error al eliminar la asignatura:", error);
        alert("Hubo un error al intentar eliminar la asignatura. Revisa tu conexión o la consola.");
      }
    }
  };

  const renderTaskStatus = (estado) => {
    switch (estado) {
      case "completada": return <span className="badge badge-green">Completada</span>;
      case "fallida": return <span className="badge badge-red">Fallida</span>;
      default: return <span className="badge badge-yellow">Pendiente</span>;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Sin fecha";
    const d = timestamp.toDate();
    return new Intl.DateTimeFormat('es-ES', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(d);
  };

  return (
    <div className="page">
      <Navbar />

      <main className="px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full animate-fade-up pb-24">
        {/* Header Asignatura */}
        <div className="relative p-6 rounded-3xl overflow-hidden shadow-lg mb-6" style={{ ...getGradientStyle(subject?.colorId), color: "#ffffff" }}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col h-full gap-3">
            
            {/* Nav interna */}
            <div className="flex justify-between items-start">
              <button onClick={() => window.location.href = "/"} className="text-white/80 hover:text-white mb-2 text-sm font-semibold flex items-center gap-1">
                ← Volver
              </button>
              
              {/* Opciones de edición/eliminación */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSubjectFormOpen(true)}
                  className="bg-black/20 hover:bg-black/40 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Editar asignatura"
                >
                  ✏️
                </button>
                <button 
                  onClick={deleteSubject}
                  className="bg-red-500/80 hover:bg-red-600/90 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm text-sm"
                  aria-label="Eliminar asignatura"
                >
                  🗑️
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold mb-1">{subject?.nombre}</h1>
            
            {/* Descripción (si existe) */}
            {subject?.descripcion && (
              <p className="text-sm font-medium opacity-90 leading-snug break-words mb-2">
                {subject.descripcion}
              </p>
            )}

            {/* Horarios Dinámicos */}
            <div className="flex flex-col gap-1 mb-2">
              {subject?.horarios && subject.horarios.length > 0 ? (
                subject.horarios.map((h, i) => (
                  <span key={i} className="text-xs font-semibold opacity-80 flex items-center gap-1.5">
                    ⏱ {h.dia}: {h.inicio} - {h.fin}
                  </span>
                ))
              ) : subject?.horario ? (
                <span className="text-xs font-semibold opacity-80">⏱ {subject.horario}</span>
              ) : null}
            </div>

            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm">
                {subject?.estado}
              </span>
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-bold">Asignatura Terminada</p>
              <p className="text-xs opacity-80">No se pueden agregar más tareas ni recordatorios.</p>
            </div>
          </div>
        )}

        {/* Pestañas Tareas / Recordatorios */}
        <div className="flex bg-zinc-800 p-1 rounded-xl mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab("tareas")}
            className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition-colors ${
              activeTab === "tareas" ? "bg-zinc-700 text-white shadow-md shadow-black/20" : "text-zinc-400 hover:text-white"
            }`}
          >
            📋 Tareas ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("recordatorios")}
            className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition-colors ${
              activeTab === "recordatorios" ? "bg-zinc-700 text-white shadow-md shadow-black/20" : "text-zinc-400 hover:text-white"
            }`}
          >
            📌 Recordatorios ({reminders.length})
          </button>
        </div>

        {/* ── SECCIÓN TAREAS ── */}
        {activeTab === "tareas" && (
          <div className="animate-fade-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Todas las tareas</h2>
              {!isCompleted && (
                <button onClick={() => setIsTaskFormOpen(true)} className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                  + Agregar
                </button>
              )}
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No hay tareas aún en esta asignatura.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.map(task => (
                  <button 
                    key={task.id} 
                    onClick={() => toggleTaskStatus(task)}
                    disabled={isCompleted}
                    className="card flex flex-col items-start gap-2 w-full text-left transition-transform active:scale-95 disabled:active:scale-100 disabled:cursor-default"
                    style={{ padding: "1rem" }}
                  >
                    <div className="flex justify-between w-full items-start gap-3">
                      <span className={`font-semibold text-sm ${task.estado === "completada" ? "line-through opacity-50" : ""}`} style={{ color: "var(--text-primary)" }}>
                        {task.titulo}
                      </span>
                      {renderTaskStatus(task.estado)}
                    </div>
                    {task.fechaVencimiento && (
                      <div className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                        <span>⏱</span> {formatDate(task.fechaVencimiento)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SECCIÓN RECORDATORIOS ── */}
        {activeTab === "recordatorios" && (
          <div className="animate-fade-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Notas y Apuntes</h2>
              {!isCompleted && (
                <button onClick={() => setIsReminderFormOpen(true)} className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                  + Guardar
                </button>
              )}
            </div>

            {reminders.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No hay recordatorios guardados.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reminders.map(rem => (
                  <div key={rem.id} className="card relative flex flex-col gap-3 group" style={{ padding: "1rem", background: "var(--bg-raised)" }}>
                    
                    {/* Botón borrar (visible siempre en móvil, hover en desktop) */}
                    {!isCompleted && (
                      <button 
                        onClick={() => deleteReminder(rem.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg z-10 sm:scale-0 sm:group-hover:scale-100 transition-transform"
                        title="Eliminar recordatorio"
                      >
                        ✕
                      </button>
                    )}

                    {rem.tipo === "nota" ? (
                      <p className="text-sm whitespace-pre-wrap flex-1" style={{ color: "var(--text-primary)" }}>
                        {rem.contenido}
                      </p>
                    ) : (
                      <button 
                        onClick={() => setSelectedImage(rem.contenido)}
                        className="block w-full overflow-hidden rounded-lg outline-none focus:ring-2 focus:ring-accent"
                      >
                        <img 
                          src={rem.contenido} 
                          alt="Recordatorio adjunto" 
                          className="w-full h-auto object-cover hover:scale-105 transition-transform cursor-zoom-in" 
                        />
                      </button>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-auto" style={{ color: "var(--text-muted)" }}>
                      {formatDate(rem.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modales Inyectados */}
      <TaskForm isOpen={isTaskFormOpen} onClose={() => setIsTaskFormOpen(false)} user={user} subjectId={subjectId} />
      <ReminderForm isOpen={isReminderFormOpen} onClose={() => setIsReminderFormOpen(false)} user={user} subjectId={subjectId} />
      
      {subject && (
        <SubjectForm isOpen={isSubjectFormOpen} onClose={() => setIsSubjectFormOpen(false)} user={user} subjectToEdit={subject} />
      )}

      {/* Visor de imágenes */}
      <ImageModal isOpen={!!selectedImage} imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />

    </div>
  );
}
