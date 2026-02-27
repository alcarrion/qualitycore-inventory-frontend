import type { Product } from './models';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

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
