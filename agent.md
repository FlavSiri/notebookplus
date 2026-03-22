# agent.md — Guía técnica de NotebookPlus

> Este archivo existe para que cualquier desarrollador o IA que trabaje en el proyecto
> tenga el contexto completo desde el primer momento. **Mantenlo actualizado.**

---

## 🧭 ¿Qué es este proyecto?

**NotebookPlus** es una aplicación web progresiva (PWA-ready) construida con React,
orientada a móvil (mobile-first) y en modo oscuro permanente. Permite a los usuarios
autenticarse, gestionar su perfil y (próximamente) organizar notas personales.

---

## 🛠 Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 19.x |
| Build tool | Vite + `@tailwindcss/vite` | 8.x / 4.x |
| Estilos | Tailwind CSS v4 | 4.2.x |
| Autenticación | Firebase Auth | 12.x |
| Base de datos | Firestore (NoSQL) | 12.x |
| Backend serverless | Firebase Functions (Node.js) | v2 |
| Despliegue | Firebase Hosting (pendiente) | — |

---

## 📁 Estructura del proyecto

```
notebookplus/
├── public/               ← Archivos estáticos servidos en /
│   └── logo.png          ← AQUÍ va el logo (referencia: /logo.png)
├── src/
│   ├── components/
│   │   └── Navbar.jsx    ← Navbar sticky con dropdown de usuario
│   ├── pages/
│   │   ├── Home.jsx      ← Página principal (guest + autenticado)
│   │   ├── Login.jsx     ← Login + Registro + Google Sign-In
│   │   └── Profile.jsx   ← Perfil: nombre y edad (Firestore)
│   ├── firebase/
│   │   └── config.js     ← Inicializa Firebase (lee variables .env)
│   ├── hooks/
│   │   └── useAuth.js    ← Hook: escucha onAuthStateChanged
│   ├── App.jsx           ← Enrutador artesanal por window.location.pathname
│   ├── main.jsx          ← Punto de entrada React
│   ├── index.css         ← Estilos globales + variables CSS dark mode
│   └── App.css           ← Vacío (limpiado del default de Vite)
├── functions/
│   └── index.js          ← Firebase Functions (placeholder, sin deploy aún)
├── firestore.rules       ← Reglas de seguridad de Firestore
├── firestore.indexes.json← Índices compuestos de Firestore (vacío por ahora)
├── .env                  ← Variables de entorno REALES (no subir a git)
├── .env.example          ← Plantilla de variables para nuevos devs
├── vite.config.js        ← Vite con plugins: tailwindcss() + react()
└── package.json          ← Dependencias del frontend
```

---

## 🔐 Firebase — Configuración actual

### Variables de entorno (`.env`)
Todas las variables de Firebase tienen el prefijo `VITE_` para que Vite las exponga al frontend:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Servicios de Firebase activos
| Servicio | Estado | Notas |
|---------|--------|-------|
| Authentication | ✅ Activo | Email/Password + Google Sign-In |
| Firestore | ✅ Activo | Modo Producción o Prueba |
| Functions | 🔧 Preparado | Sin funciones deployadas aún |
| Hosting | ⏳ Pendiente | Configurar con `firebase deploy` |

---

## 🗄 Firestore — Modelo de datos

### Colección: `users`
Documento por usuario, identificado por su **UID de Firebase Auth**.

```
users/
└── {uid}/
    ├── nombre      : string   — Nombre completo del usuario
    ├── edad        : number   — Edad del usuario
    ├── email       : string   — Copia del email de Auth
    └── updatedAt   : timestamp — Última actualización del perfil
```

**Cómo se escribe:** `setDoc(ref, data, { merge: true })` — nunca sobreescribe campos no enviados.

**Cuándo se lee:** Al montar `Profile.jsx`, via `getDoc`.

---

## 🔒 Firestore Rules (`firestore.rules`)

Estado actual: **modo abierto temporal** (caduca el 2026-04-18).
```
allow read, write: if request.time < timestamp.date(2026, 4, 18);
```

> ⚠️ **ANTES de lanzar a producción**, reemplazar con reglas granulares:
> ```javascript
> match /users/{uid} {
>   allow read, write: if request.auth != null && request.auth.uid == uid;
> }
> ```

---

## 🗂 Índices Firestore (`firestore.indexes.json`)

Sin índices compuestos definidos aún (`"indexes": []`).

**Cuándo agregar:** Si se hacen queries con más de un filtro o con `orderBy` sobre campos distintos,
Firestore lanzará un error con un enlace directo para crear el índice. Copiar esa URL en el
navegador lo crea automáticamente. Luego exportarlo con:
```bash
firebase firestore:indexes > firestore.indexes.json
```

---

## 🖌 Sistema de diseño (Dark Mode)

Variables CSS definidas en `src/index.css`:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--bg-base` | `#0f0f11` | Fondo de página |
| `--bg-surface` | `#18181b` | Tarjetas, Navbar |
| `--bg-raised` | `#27272a` | Inputs, elementos elevados |
| `--bg-hover` | `#3f3f46` | Hover de elementos |
| `--accent` | `#7c3aed` | Violeta principal |
| `--accent-light` | `rgba(124,58,237,.15)` | Fondos con acento |
| `--text-primary` | `#fafafa` | Texto principal |
| `--text-secondary` | `#a1a1aa` | Texto secundario |
| `--text-muted` | `#71717a` | Texto apagado |
| `--border` | `#3f3f46` | Bordes visibles |

### Clases utilitarias globales
- `.btn-primary` — botón violeta full-width
- `.btn-ghost` — botón outline oscuro full-width
- `.card` — tarjeta con borde y hover
- `.badge`, `.badge-purple/green/red/yellow` — etiquetas de estado
- `.divider` — línea divisora con texto central
- `.animate-fade-up` — animación de entrada (opacity + translateY)
- `.animate-pulse-glow` — glow pulsante (usado en iconos destacados)

---

## 🧩 Enrutamiento

El proyecto usa **enrutamiento artesanal** basado en `window.location.pathname` (sin librería).

| Ruta | Componente | Navbar incluida |
|------|-----------|----------------|
| `/` | `Home.jsx` | ✅ (desde App.jsx) |
| `/login` | `Login.jsx` | ❌ |
| `/perfil` | `Profile.jsx` | ✅ (interna, la incluye ella misma) |

Para agregar una nueva página:
1. Crear `src/pages/MiPagina.jsx`
2. Importarla en `App.jsx`
3. Agregar `if (path === "/mi-pagina") return <MiPagina />;` en `renderPage()`
4. Si la página tiene su propia Navbar, agregar `"/mi-pagina"` al array `standalonePages`

> 📌 Para proyectos más grandes se recomienda migrar a `react-router-dom`.

---

## ⚙️ Comandos útiles

```bash
# Desarrollo local
npm run dev          # http://localhost:5173

# Verificar que compila
npm run build

# Desplegar a Firebase Hosting (cuando esté configurado)
firebase deploy

# Desplegar solo Firestore rules
firebase deploy --only firestore:rules

# Desplegar solo Functions
firebase deploy --only functions

# Ver y exportar índices actuales
firebase firestore:indexes
```

---

## 📌 Decisiones técnicas importantes

1. **Tailwind v4** — Se activa con `@import "tailwindcss"` en el CSS **y** el plugin
   `tailwindcss()` en `vite.config.js`. Sin el plugin, los estilos no se aplican.
   Google Fonts `@import url(...)` debe ir **antes** de `@import "tailwindcss"`.

2. **Firebase v12 (modular)** — Se importa por módulos específicos (tree-shaking).
   Nunca usar el SDK compat (`firebase/compat/*`).

3. **`font-size: 16px` en inputs** — Evita el zoom automático en iOS Safari.

4. **`setDoc` con `merge: true`** — Patrón estándar para actualizar documentos de usuario
   sin riesgo de borrar campos existentes.

5. **`updateProfile(auth.currentUser, { displayName })`** — Se llama junto con el
   `setDoc` de Firestore para que el nombre aparezca en la Navbar inmediatamente.

---

## 🚧 Próximas funcionalidades sugeridas

- [ ] Módulo de **notas** (colección `notes/{uid}/items`)
- [ ] Foto de perfil (Firebase Storage)
- [ ] Notificaciones push (FCM)
- [ ] Despliegue en Firebase Hosting
- [ ] Reglas de Firestore granulares antes del deploy
- [ ] Migrar a `react-router-dom` cuando haya más de 5 rutas
