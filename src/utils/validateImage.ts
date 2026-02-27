// utils/validateImage.ts
import { IMAGE_CONFIG } from '../constants/config';
import { ERRORS } from '../constants/messages';

/**
 * Validates an image file for type, size, and dimensions.
 * @param file - The image file to validate
 * @param showError - Function to display error messages
 * @returns true if valid, false otherwise
 */
export async function validateImage(
  file: File,
  showError: (message: string) => void
): Promise<boolean> {
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    showError(ERRORS.IMAGE_FORMAT);
    return false;
  }

  if (file.size > IMAGE_CONFIG.MAX_SIZE_BYTES) {
    showError(ERRORS.IMAGE_SIZE);
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < IMAGE_CONFIG.MIN_WIDTH || img.height < IMAGE_CONFIG.MIN_HEIGHT) {
        showError(ERRORS.IMAGE_MIN_DIMENSIONS(IMAGE_CONFIG.MIN_WIDTH));
        resolve(false);
      } else if (img.width > IMAGE_CONFIG.MAX_WIDTH || img.height > IMAGE_CONFIG.MAX_HEIGHT) {
        showError(ERRORS.IMAGE_MAX_DIMENSIONS(IMAGE_CONFIG.MAX_WIDTH));
        resolve(false);
      } else {
        resolve(true);
      }
    };
    img.onerror = () => {
      showError(ERRORS.IMAGE_LOAD_ERROR);
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
}
