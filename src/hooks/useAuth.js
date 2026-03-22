// src/hooks/useAuth.js
// -------------------------------------------------------
// Hook personalizado para saber si el usuario está
// autenticado o no en cualquier componente de tu app.
// -------------------------------------------------------

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

export function useAuth() {
  const [user, setUser] = useState(null);       // usuario actual (o null si no está logueado)
  const [loading, setLoading] = useState(true); // true mientras Firebase verifica la sesión

  useEffect(() => {
    // Firebase nos avisa cada vez que el estado de sesión cambia
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiamos el listener cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
