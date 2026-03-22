// src/firebase/config.js
// -------------------------------------------------------
// Configuración de Firebase para tu proyecto.
// Las credenciales se leen desde variables de entorno (.env)
// NUNCA pongas tus claves directamente aquí.
// -------------------------------------------------------

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que vas a usar en tu app
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
