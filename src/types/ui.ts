import type { Product } from './models';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Producto enriquecido con disponibilidad calculada en el cliente.
 * availableStock = current_stock menos lo que ya está en el carrito.
 * No es un campo de la API — solo existe en el contexto del formulario de transacciones.
 */
export type ProductWithAvailability = Product & { availableStock?: number };

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ModalType = 'input' | 'output' | 'adjustment' | 'correction' | null;
