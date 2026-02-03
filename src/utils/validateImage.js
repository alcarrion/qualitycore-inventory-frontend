// utils/validateImage.js

/**
 * Validates an image file for type, size, and dimensions.
 * @param {File} file - The image file to validate
 * @param {Function} showError - Function to display error messages
 * @returns {Promise<boolean>} true if valid, false otherwise
 */
export async function validateImage(file, showError) {
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB en bytes
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 300;
  const MAX_WIDTH = 2000;
  const MAX_HEIGHT = 2000;

  if (!ALLOWED_TYPES.includes(file.type)) {
    showError("Solo se permiten imágenes JPG o PNG.");
    return false;
  }

  if (file.size > MAX_SIZE) {
    showError("El archivo debe ser menor a 2MB.");
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
        showError(`La imagen debe tener al menos ${MIN_WIDTH}x${MIN_HEIGHT} píxeles.`);
        resolve(false);
      } else if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
        showError(`La imagen es demasiado grande (máximo ${MAX_WIDTH}x${MAX_HEIGHT} píxeles).`);
        resolve(false);
      } else {
        resolve(true);
      }
    };
    img.onerror = () => {
      showError("No se pudo cargar la imagen.");
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
}
