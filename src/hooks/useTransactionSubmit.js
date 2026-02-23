// hooks/useTransactionSubmit.js
import { useCallback } from "react";
import { postSale, postPurchase, checkStock, postCorrection, getSale, getPurchase } from "../services/api";
import { useDataStore } from "../store/dataStore";
import { useApp } from "../contexts/AppContext";
import { ERRORS, SUCCESS } from "../constants/messages";

/**
 * Hook para manejar el submit de transacciones (compras/ventas)
 * y correcciones de movimientos.
 */
export function useTransactionSubmit({
  modalType, selectedSupplier, selectedCustomer,
  cart, adjustCartStock, handleConfirmClose,
  loadTransactions, modal,
}) {
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
      if (stockCheck.ok && !stockCheck.data.all_available) {
        showError(ERRORS.STOCK_CHANGED(stockCheck.data.unavailable));
        adjustCartStock(stockCheck.data.unavailable);
        await reloadData();
        return;
      }
    }

    const requestData = isPurchase
      ? { supplier: Number(selectedSupplier), items }
      : { customer: Number(selectedCustomer), items };

    const resp = isPurchase
      ? await postPurchase(requestData)
      : await postSale(requestData);

    if (resp.ok) {
      await reloadData();
      handleConfirmClose();
      const action = isPurchase ? "Compra" : "Venta";
      showSuccess(SUCCESS.TRANSACTION_CREATED(action, cart.length));
    } else {
      const entityError = isPurchase ? resp.data?.supplier?.[0] : resp.data?.customer?.[0];
      const transactionType = isPurchase ? "compra" : "venta";
      showError(resp.data?.detail || entityError || resp.data?.items?.[0] || ERRORS.TRANSACTION_FAILED(transactionType));
      await reloadData();
    }
  }, [modalType, selectedSupplier, selectedCustomer, cart, reloadData, handleConfirmClose, showSuccess, showError, adjustCartStock]);

  const handleCorrection = useCallback(async (movementId, data, invoiceType, invoiceId) => {
    const resp = await postCorrection(movementId, data);
    if (resp.ok) {
      await reloadData();
      showSuccess("Corrección registrada correctamente.");
      if (invoiceType === 'sale' && invoiceId) {
        const res = await getSale(invoiceId);
        if (res.ok) modal.setSelectedSale(res.data);
      }
      if (invoiceType === 'purchase' && invoiceId) {
        const res = await getPurchase(invoiceId);
        if (res.ok) modal.setSelectedPurchase(res.data);
      }
      return true;
    } else {
      const errorMsg = resp.data?.detail
        || resp.data?.non_field_errors?.[0]
        || (Array.isArray(resp.data) ? resp.data[0] : null)
        || "Error al registrar la corrección.";
      showError(errorMsg);
      return false;
    }
  }, [reloadData, showSuccess, showError, modal]);

  return { handleSubmit, handleCorrection };
}
