// hooks/useContactSearch.ts
// Gestiona los dropdowns lazy de Cliente y Proveedor en el formulario de transacciones.
// Separado de useProductDropdown para reducir la superficie de cada hook.
import { useState, useCallback } from "react";
import { useLazyDropdown } from "./useLazyDropdown";
import { useCustomerSearch } from "./useCustomerSearch";
import { useSupplierSearch } from "./useSupplierSearch";
import type { Customer, Supplier } from "../types/models";
import type { CartItem } from "../types/ui";

interface ContactSearchProps {
  setSelectedCustomer: (value: string | number) => void;
  setSelectedSupplier: (value: string | number) => void;
  /** Cart actual — se limpia cuando cambia el proveedor en modo compra */
  cart: CartItem[];
  cartClearCart: () => void;
  selectedSupplier: string | number;
}

export function useContactSearch({
  setSelectedCustomer,
  setSelectedSupplier,
  cart,
  cartClearCart,
  selectedSupplier,
}: ContactSearchProps) {
  // --- Clientes ---
  const [customerSearchText, setCustomerSearchText] = useState("");
  const { customers: serverCustomers } = useCustomerSearch(customerSearchText);
  const {
    dropdown: customerDropdown,
    confirmSelection: confirmCustomer,
    clear: clearCustomer,
  } = useLazyDropdown<Customer>(serverCustomers, setCustomerSearchText);

  // --- Proveedores ---
  const [supplierSearchText, setSupplierSearchText] = useState("");
  const { suppliers: serverSuppliers } = useSupplierSearch(supplierSearchText);
  const {
    dropdown: supplierDropdown,
    confirmSelection: confirmSupplier,
    clear: clearSupplier,
  } = useLazyDropdown<Supplier>(serverSuppliers, setSupplierSearchText);

  // Cuando cambia el proveedor se limpia el carrito para evitar mezclar productos de distintos proveedores
  const handleSupplierChange = useCallback(
    (newSupplierId: string | number) => {
      if (cart.length > 0 && selectedSupplier && selectedSupplier !== newSupplierId) {
        cartClearCart();
      }
      setSelectedSupplier(newSupplierId);
    },
    [cart.length, selectedSupplier, cartClearCart, setSelectedSupplier]
  );

  const selectCustomer = useCallback(
    (customer: Customer, closeOtherDropdowns: () => void) => {
      setSelectedCustomer(customer.id);
      confirmCustomer(customer, customer.name);
      closeOtherDropdowns();
    },
    [setSelectedCustomer, confirmCustomer]
  );

  const selectSupplier = useCallback(
    (supplier: Supplier, closeOtherDropdowns: () => void) => {
      handleSupplierChange(supplier.id);
      confirmSupplier(supplier, supplier.name);
      closeOtherDropdowns();
    },
    [handleSupplierChange, confirmSupplier]
  );

  return {
    customerDropdown,
    supplierDropdown,
    selectCustomer,
    selectSupplier,
    handleSupplierChange,
    clearCustomer,
    clearSupplier,
  };
}
