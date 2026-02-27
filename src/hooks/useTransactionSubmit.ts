// hooks/useTransactionSubmit.ts
import { useCallback } from "react";
import { postSale, postPurchase, checkStock, postCorrection, getSale, getPurchase } from "../services/api";
import { useDataStore } from "../store/dataStore";
import { useApp } from "../contexts/AppContext";
import { ERRORS, SUCCESS } from "../constants/messages";
import type { Sale, Purchase } from "../types/models";
import type { CartItem } from "../types/ui";

interface ModalActions {
  setSelectedSale: (sale: Sale | null) => void;
  setSelectedPurchase: (purchase: Purchase | null) => void;
}

interface TransactionSubmitParams {
  modalType: string;
  selectedSupplier: string | number;
  selectedCustomer: string | number;
  cart: CartItem[];
  adjustCartStock: (unavailable: Array<{ product_id: number; available: number }>) => void;
  handleConfirmClose: () => void;
  loadTransactions: () => void;
  modal: ModalActions;
}

/**
 * Hook para manejar el submit de transacciones (compras/ventas)
 * y correcciones de movimientos.
 */
export function useTransactionSubmit({
  modalType, selectedSupplier, selectedCustomer,
  cart, adjustCartStock, handleConfirmClose,
  loadTransactions, modal,
}: TransactionSubmitParams) {
  const { showSuccess, showError } = useApp();
  const fetchProducts = useDataStore(state => state.fetchProducts);
  const fetchAlerts = useDataStore(state => state.fetchAlerts);
  const fetchDashboard = useDataStore(state => state.fetchDashboard);

  const reloadData = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchAlerts(), fetchDashboard()]);
    loadTransactions();
    window.dispatchEvent(new Event("recargarInventario"));
  }, [fetchProducts, fetchAlerts, fetchDashboard, loadTransactions]);

  const handleSubmit = useCallback(async () => {
    const isPurchase = modalType === "input";
    const entity = isPurchase ? selectedSupplier : selectedCustomer;

    if (!entity) {
      showError(isPurchase ? ERRORS.SELECT_SUPPLIER_FIRST : ERRORS.SELECT_CUSTOMER_FIRST);
      return;
    }
    if (cart.length === 0) {
      showError(ERRORS.EMPTY_CART);
      return;
    }

    const items = cart.map((item) => ({
      product: item.product.id,
      quantity: item.quantity,
    }));

    if (!isPurchase) {
      const stockCheck = await checkStock(items);
      if (stockCheck.ok && stockCheck.data && !stockCheck.data.all_available) {
        showError(ERRORS.STOCK_CHANGED(stockCheck.data.unavailable));
        adjustCartStock(stockCheck.data.unavailable);
        await reloadData();
        return;
      }
    }

    const resp = isPurchase
      ? await postPurchase({ supplier: Number(selectedSupplier), items })
      : await postSale({ customer: Number(selectedCustomer), items });

    if (resp.ok) {
      await reloadData();
      handleConfirmClose();
      const action = isPurchase ? "Compra" : "Venta";
      showSuccess(SUCCESS.TRANSACTION_CREATED(action, cart.length));
    } else {
      const errData = resp.data as {
        detail?: string;
        supplier?: string[];
        customer?: string[];
        items?: string[];
      } | null;
      const entityError = isPurchase ? errData?.supplier?.[0] : errData?.customer?.[0];
      const transactionType = isPurchase ? "compra" : "venta";
      showError(errData?.detail || entityError || errData?.items?.[0] || ERRORS.TRANSACTION_FAILED(transactionType));
      await reloadData();
    }
  }, [modalType, selectedSupplier, selectedCustomer, cart, reloadData, handleConfirmClose, showSuccess, showError, adjustCartStock]);

  const handleCorrection = useCallback(async (
    movementId: number,
    data: Record<string, unknown>,
    invoiceType: 'sale' | 'purchase' | null,
    invoiceId: number | null
  ): Promise<boolean> => {
    const resp = await postCorrection(movementId, data);
    if (resp.ok) {
      await reloadData();
      showSuccess("Corrección registrada correctamente.");
      if (invoiceType === 'sale' && invoiceId) {
        const res = await getSale(invoiceId);
        if (res.ok) modal.setSelectedSale(res.data as Sale | null);
      }
      if (invoiceType === 'purchase' && invoiceId) {
        const res = await getPurchase(invoiceId);
        if (res.ok) modal.setSelectedPurchase(res.data as Purchase | null);
      }
      return true;
    } else {
      const errData = resp.data as { detail?: string; non_field_errors?: string[] } | string[] | null;
      const errorMsg =
        (errData as { detail?: string } | null)?.detail ||
        (errData as { non_field_errors?: string[] } | null)?.non_field_errors?.[0] ||
        (Array.isArray(errData) ? (errData as string[])[0] : null) ||
        "Error al registrar la corrección.";
      showError(errorMsg);
      return false;
    }
  }, [reloadData, showSuccess, showError, modal]);

  return { handleSubmit, handleCorrection };
}
