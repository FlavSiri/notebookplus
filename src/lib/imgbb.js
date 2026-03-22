// src/lib/imgbb.js
// -------------------------------------------------------
// Utilidad para subir imágenes a ImgBB.
// Usa la clave VITE_IMGBB_API_KEY del archivo .env
// -------------------------------------------------------

/**
 * Sube una imagen a ImgBB y devuelve la URL pública.
 * @param {File} file - El archivo de imagen proveniente de un input type="file".
 * @returns {Promise<string>} La URL directa de la imagen subida.
 */
export async function uploadImageToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_IMGBB_API_KEY no está configurada en el archivo .env");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de ImgBB");
    }

    const data = await response.json();

    if (data && data.success) {
      // data.data.url contiene la URL directa de la imagen
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Error al subir a ImgBB");
    }
  } catch (error) {
    console.error("Error uploadImageToImgBB:", error);
    throw error;
  }
}
