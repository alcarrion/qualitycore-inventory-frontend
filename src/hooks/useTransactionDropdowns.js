// hooks/useTransactionDropdowns.js
import { useEffect, useCallback, useMemo } from "react";
import { useDropdownSearch } from "./useDropdownSearch";

/**
 * Hook para manejar la configuración y selección de dropdowns
 * de cliente, proveedor y producto en transacciones.
 */
export function useTransactionDropdowns({
  products, customers, suppliers,
  modalType, selectedSupplier, cart,
  cartClearCart, setSelectedCustomer, setSelectedSupplier,
  showModal, formData, setFormData,
}) {
  const customerDropdown = useDropdownSearch(customers);
  const supplierDropdown = useDropdownSearch(suppliers);

  const productItems = useMemo(() => {
    let items = products;
    if (modalType === "input" && selectedSupplier) {
      items = items.filter((p) => p.supplier === Number(selectedSupplier));
    }
    if (modalType === "output") {
      items = items.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        const availableStock = cartItem ? p.current_stock - cartItem.quantity : p.current_stock;
        return { ...p, availableStock };
      });
    }
    return items;
  }, [products, modalType, selectedSupplier, cart]);

  const productDropdown = useDropdownSearch(productItems);

  const closeAllDropdowns = useCallback(() => {
    customerDropdown.setIsOpen(false);
    supplierDropdown.setIsOpen(false);
    productDropdown.setIsOpen(false);
  }, [customerDropdown, supplierDropdown, productDropdown]);

  // Click outside cierra dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.formGroup')) closeAllDropdowns();
    };
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal, closeAllDropdowns]);

  // --- Select handlers ---
  const selectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer.id);
    customerDropdown.select(customer.name);
  }, [setSelectedCustomer, customerDropdown]);

  const handleSupplierChange = useCallback((newSupplierId) => {
    if (cart.length > 0 && selectedSupplier && selectedSupplier !== newSupplierId) {
      cartClearCart();
      productDropdown.clear();
      setFormData((prev) => ({ ...prev, product: "", quantity: "" }));
    }
    setSelectedSupplier(newSupplierId);
  }, [cart.length, selectedSupplier, cartClearCart, setSelectedSupplier, productDropdown, setFormData]);

  const selectSupplier = useCallback((supplier) => {
    handleSupplierChange(supplier.id);
    supplierDropdown.select(supplier.name);
  }, [handleSupplierChange, supplierDropdown]);

  const selectProduct = useCallback((product) => {
    setFormData((prev) => ({ ...prev, product: product.id }));
    const displayStock = product.availableStock ?? product.current_stock;
    productDropdown.select(`${product.name} (Stock: ${displayStock})`);
    customerDropdown.setIsOpen(false);
    supplierDropdown.setIsOpen(false);
  }, [productDropdown, customerDropdown, supplierDropdown, setFormData]);

  const clearDropdowns = useCallback(() => {
    customerDropdown.clear();
    supplierDropdown.clear();
    productDropdown.clear();
  }, [customerDropdown, supplierDropdown, productDropdown]);

  return {
    customerDropdown,
    supplierDropdown,
    productDropdown,
    selectCustomer,
    selectSupplier,
    selectProduct,
    handleSupplierChange,
    clearDropdowns,
  };
}
