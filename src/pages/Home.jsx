// src/pages/Home.jsx
// -------------------------------------------------------
// Dashboard principal de NotebookPlus.
// Muestra la lista de asignaturas y alertas de tareas si
// el usuario está logueado, o la Landing Page si es invitado.
// -------------------------------------------------------

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDocs, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import SubjectForm, { GRADIENTS } from "../components/SubjectForm";

// Helper para obtener colores del config de GRADIENTS
const getGradientStyle = (colorId) => {
  const g = GRADIENTS.find((c) => c.id === colorId) || GRADIENTS[0];
  return { background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` };
};

export default function Home() {
  const { user, loading } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  const [showEmptyState, setShowEmptyState] = useState(false);
  
  // Estado para la alerta de tareas próximas a vencer
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // Escuchar asignaturas en tiempo real
  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setFetchingSubjects(false);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "subjects"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((sub) => sub.estado !== "eliminada");
        setSubjects(list);
        setFetchingSubjects(false);
      },
      (error) => {
        console.error("Error cargando asignaturas:", error);
        setFetchingSubjects(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Evitar "Flash of Empty State" cuando Firebase local devuelve 0 pero la red aún carga
  useEffect(() => {
    let t;
    if (!fetchingSubjects && subjects.length === 0) {
      t = setTimeout(() => setShowEmptyState(true), 350);
    } else {
      setShowEmptyState(false);
    }
    return () => clearTimeout(t);
  }, [fetchingSubjects, subjects.length]);

  // Cargar Tareas Pendientes para Alertas
  useEffect(() => {
    if (!user || subjects.length === 0) return;

    const fetchPendingTasks = async () => {
      try {
        let allPending = [];
        const now = new Date();
        // Definimos "próxima a vencer" como: en los próximos 7 días, o ya vencida pero "pendiente".
        const limiteVencimiento = new Date();
        limiteVencimiento.setDate(now.getDate() + 7);

        // Hacemos un fetch manual iterando sobre cada asignatura
        for (const sub of subjects) {
          if (sub.estado !== "activa") continue;

          const tasksRef = collection(db, "users", user.uid, "subjects", sub.id, "tasks");
          const qTasks = query(tasksRef, where("estado", "==", "pendiente"));
          const snap = await getDocs(qTasks);
          
          snap.forEach(doc => {
            const data = doc.data();
            if (data.fechaVencimiento) {
              const taskDate = data.fechaVencimiento.toDate();
              if (taskDate < limiteVencimiento) {
                allPending.push({
                  id: doc.id,
                  subjectId: sub.id,
                  subjectName: sub.nombre,
                  ...data,
                  taskDate // Objeto Date puro para ordenar
                });
              }
            }
          });
        }

        // Ordenar por fecha más próxima primero
        allPending.sort((a, b) => a.taskDate - b.taskDate);
        // Tomar solo las 3 más urgentes
        setUpcomingTasks(allPending.slice(0, 3));

      } catch (err) {
        console.error("Error buscando tareas urgentes:", err);
      }
    };

    fetchPendingTasks();
  }, [user, subjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1" style={{ minHeight: "80vh" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // ── Vista de Invitado (Landing Page) ──
  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center px-5 py-12 animate-fade-up" style={{ minHeight: "calc(100vh - 57px)" }}>
        <div className="fixed top-32 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "var(--accent)" }} />
        <div className="relative w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 animate-pulse-glow" style={{ background: "var(--accent-light)", border: "1px solid rgba(124,58,237,0.3)" }}>
            📔
          </div>
          <h1 className="text-3xl font-extrabold mb-2 text-primary">NotebookPlus</h1>
          <p className="text-secondary mb-8">Tu espacio personal para organizar notas</p>

          <div className="space-y-3 mb-8 text-left">
            {[
              { icon: "⚡", title: "Rápido", desc: "Escribe y guarda al instante" },
              { icon: "🎨", title: "Visual", desc: "Asignaturas con degradados" },
              { icon: "📱", title: "Móvil", desc: "Diseñado para donde vayas" },
            ].map((f) => (
              <div key={f.title} className="card flex items-center gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-primary">{f.title}</p>
                  <p className="text-xs text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button className="btn-primary" onClick={() => window.location.href='/login'}>Comenzar gratis</button>
            <button className="btn-ghost" onClick={() => window.location.href='/login'}>Ya tengo cuenta</button>
          </div>
        </div>
      </main>
    );
  }

  // ── Vista de Usuario (Dashboard) ──
  return (
    <main className="page px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full animate-fade-up">

      {/* Saludo */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">
          ¡Hola, {user.displayName?.split(" ")[0] || "estudiante"}! 👋
        </h1>
        <p className="text-sm text-muted">Aquí tienes tus clases y pendientes.</p>
      </div>

      {/* Alerta de Tareas Cercanas */}
      {upcomingTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Tareas próximas a vencer
          </h2>
          <div className="flex flex-col gap-3">
            {upcomingTasks.map(task => {
              const overdue = task.taskDate < new Date();
              return (
                <a
                  key={task.id}
                  href={`/asignatura/${task.subjectId}`}
                  className="card flex flex-col items-start gap-1 w-full text-left transition-transform active:scale-95"
                  style={{ padding: "0.85rem 1rem", borderLeft: overdue ? "3px solid #f87171" : "3px solid #facc15" }}
                >
                  <div className="flex justify-between w-full items-start gap-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)", lineHeight: "1.2" }}>
                      {task.titulo}
                    </span>
                    <span className={`badge ${overdue ? "badge-red" : "badge-yellow"} shrink-0`}>
                      {overdue ? "Vencida" : "Pronto"}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <span className="opacity-80 pr-1 border-r border-zinc-700">{task.subjectName}</span>
                    <span>⏱ {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(task.taskDate)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid de Asignaturas */}
      <h2 className="text-xs font-bold uppercase tracking-wider mb-3 mt-8" style={{ color: "var(--text-secondary)" }}>
        Tus Asignaturas
      </h2>
      {fetchingSubjects ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-zinc-800/50 border border-zinc-700/30 w-full h-32 animate-pulse flex flex-col justify-between">
              <div>
                <div className="h-5 bg-zinc-700/50 rounded-md w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-700/50 rounded-md w-1/2"></div>
              </div>
              <div className="flex justify-between mt-auto">
                <div className="h-4 bg-zinc-700/50 rounded-md w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 relative">
          {subjects.map((sub) => (
            <a
              key={sub.id}
              href={`/asignatura/${sub.id}`}
              className="relative p-5 rounded-2xl overflow-hidden shadow-lg transition-transform active:scale-95 hover:-translate-y-1 block"
              style={{ ...getGradientStyle(sub.colorId), color: "#ffffff" }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold leading-tight mb-1 opacity-90">{sub.nombre}</h3>
                  {sub.horarios && sub.horarios.length > 0 ? (
                    <p className="text-xs font-medium opacity-75">
                      {sub.horarios.map(h => `${h.dia.substring(0, 3)} ${h.inicio}`).join(' • ')}
                    </p>
                  ) : sub.horario ? (
                    <p className="text-xs font-medium opacity-75">{sub.horario}</p>
                  ) : null}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm">
                    {sub.estado}
                  </span>
                  <span className="text-xl opacity-50">→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12 px-4 card mb-8 border-dashed bg-opacity-50 animate-fade-up">
          <span className="text-4xl mb-3 block">📚</span>
          <p className="text-sm text-secondary font-medium">Aún no tienes asignaturas</p>
          <p className="text-xs text-muted mt-1">Organiza tus clases creando la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-zinc-800/50 border border-zinc-700/30 w-full h-32 animate-pulse flex flex-col justify-between">
              <div>
                <div className="h-5 bg-zinc-700/50 rounded-md w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-700/50 rounded-md w-1/2"></div>
              </div>
              <div className="flex justify-between mt-auto">
                <div className="h-4 bg-zinc-700/50 rounded-md w-16"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="btn-primary sticky bottom-6 shadow-xl shadow-indigo-500/20"
      >
        <span>+</span> Nueva Asignatura
      </button>

      <SubjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={user}
      />

    </main>
  );
}
