// src/components/ImageModal.jsx
// -------------------------------------------------------
// Modal sencillo de pantalla completa para ver imágenes.
// Cerrarlo haciendo clic fuera o en la X.
// -------------------------------------------------------

import { useEffect } from "react";

export default function ImageModal({ isOpen, onClose, imageUrl }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-up"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl transition-colors z-10"
      >
        ✕
      </button>
      <img 
        src={imageUrl} 
        alt="Previsualización" 
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al clickear la imagen
      />
    </div>
  );
}
