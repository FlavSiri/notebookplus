# 📔 NotebookPlus — Guía para Principiantes

Proyecto base con **React + Tailwind CSS + Firebase**.

---

## 🛠 Tecnologías usadas

| Tecnología | ¿Para qué sirve? |
|------------|-----------------|
| **Vite** | Arranca el proyecto rápido en modo desarrollo |
| **React 18** | Construye la interfaz con componentes |
| **Tailwind CSS v4** | Estilos directamente en el HTML |
| **Firebase v10** | Autenticación de usuarios y base de datos |

---

## 📁 Estructura del proyecto

```
src/
├── components/       ← Piezas reutilizables (Navbar, botones, etc.)
│   └── Navbar.jsx
├── pages/            ← Pantallas de la app
│   ├── Home.jsx
│   └── Login.jsx
├── firebase/         ← Configuración de Firebase
│   └── config.js
├── hooks/            ← Funciones reutilizables de React
│   └── useAuth.js
├── App.jsx           ← Componente principal (enrutamiento)
└── main.jsx          ← Punto de entrada
```

---

## 🚀 Pasos para arrancar el proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Firebase

**a)** Ve a [https://console.firebase.google.com](https://console.firebase.google.com)  
**b)** Crea un nuevo proyecto  
**c)** En tu proyecto → ⚙️ Configuración → Tu app web → copia las credenciales  
**d)** Anda a tu proyecto y activa **Authentication** → Email/contraseña  

**e)** Crea el archivo `.env` en la raíz del proyecto:
```bash
# Copia el archivo de ejemplo
copy .env.example .env
```
Luego abre `.env` y reemplaza los valores con tus credenciales reales de Firebase.

### 3. Arrancar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en: **http://localhost:5173**

---

## ✏️ Cómo agregar una nueva página

1. Crea un archivo en `src/pages/MiPagina.jsx`
2. Agrega la ruta en `src/App.jsx`:
```jsx
if (path === "/mi-pagina") return <MiPagina />;
```

> **Tip**: Para proyectos más grandes, instala React Router Dom:
> ```bash
> npm install react-router-dom
> ```

---

## 🔥 Cómo usar Firestore (base de datos)

```jsx
import { db } from "../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Guardar un documento
await addDoc(collection(db, "notas"), {
  titulo: "Mi primera nota",
  contenido: "Hola mundo",
  fecha: new Date(),
});

// Leer documentos
const snapshot = await getDocs(collection(db, "notas"));
snapshot.forEach((doc) => console.log(doc.id, doc.data()));
```

---

## 📦 Scripts disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Previsualiza el build de producción
```

---

## ❓ Preguntas frecuentes

**¿Por qué no funciona Firebase?**  
→ Asegúrate de haber creado el archivo `.env` con tus credenciales reales.

**¿Las clases de Tailwind no tienen efecto?**  
→ Verifica que `src/index.css` tenga `@import "tailwindcss";` y que se importe en `main.jsx`.

**¿Cómo subo esto a internet gratis?**  
→ Usa [Firebase Hosting](https://firebase.google.com/docs/hosting) o [Vercel](https://vercel.com).
