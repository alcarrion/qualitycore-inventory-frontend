// hooks/useTransactionDropdowns.ts
// Composición de useContactSearch + useProductDropdown.
// La API pública es idéntica a antes — cero cambios en consumidores.
import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useContactSearch } from "./useContactSearch";
import { useProductDropdown } from "./useProductDropdown";
import type { Customer, Supplier } from "../types/models";
import type { CartItem } from "../types/ui";

export interface TransactionFormData {
  quantity: string;
  product: string | number;
  customer: string;
}

interface TransactionDropdownsProps {
  modalType: string;
  selectedSupplier: string | number;
  cart: CartItem[];
  cartClearCart: () => void;
  setSelectedCustomer: (value: string | number) => void;
  setSelectedSupplier: (value: string | number) => void;
  showModal: boolean;
  formData: TransactionFormData;
  setFormData: Dispatch<SetStateAction<TransactionFormData>>;
}

export function useTransactionDropdowns({
  modalType, selectedSupplier, cart,
  cartClearCart, setSelectedCustomer, setSelectedSupplier,
  showModal, formData: _formData, setFormData,
}: TransactionDropdownsProps) {

  const contacts = useContactSearch({
    setSelectedCustomer,
    setSelectedSupplier,
    cart,
    cartClearCart,
    selectedSupplier,
  });

  const productHook = useProductDropdown({
    modalType,
    selectedSupplier,
    cart,
    setFormData,
  });

  // Cierra todos los dropdowns — usado como callback "closeOtherDropdowns"
  const closeAllDropdowns = useCallback(() => {
    contacts.customerDropdown.setIsOpen(false);
    contacts.supplierDropdown.setIsOpen(false);
    productHook.productDropdown.setIsOpen(false);
  }, [contacts.customerDropdown, contacts.supplierDropdown, productHook.productDropdown]);

  // Click fuera de .formGroup cierra todos los dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.formGroup')) closeAllDropdowns();
    };
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal, closeAllDropdowns]);

  // Adapta los handlers de contactSearch para cerrar los otros dropdowns
  const selectCustomer = useCallback(
    (customer: Customer) => contacts.selectCustomer(customer, () => {
      contacts.supplierDropdown.setIsOpen(false);
      productHook.productDropdown.setIsOpen(false);
    }),
    [contacts, productHook.productDropdown]
  );

  const selectSupplier = useCallback(
    (supplier: Supplier) => contacts.selectSupplier(supplier, () => {
      contacts.customerDropdown.setIsOpen(false);
      productHook.productDropdown.setIsOpen(false);
    }),
    [contacts, productHook.productDropdown]
  );

  const selectProduct = useCallback(
    (product: Parameters<typeof productHook.selectProduct>[0]) =>
      productHook.selectProduct(product, () => {
        contacts.customerDropdown.setIsOpen(false);
        contacts.supplierDropdown.setIsOpen(false);
      }),
    [productHook, contacts.customerDropdown, contacts.supplierDropdown]
  );

  const clearDropdowns = useCallback(() => {
    contacts.clearCustomer();
    contacts.clearSupplier();
    productHook.clearProduct();
  }, [contacts, productHook]);

  return {
    customerDropdown: contacts.customerDropdown,
    supplierDropdown: contacts.supplierDropdown,
    productDropdown: productHook.productDropdown,
    selectedProductObj: productHook.selectedProductObj,
    selectCustomer,
    selectSupplier,
    selectProduct,
    handleSupplierChange: contacts.handleSupplierChange,
    clearDropdowns,
  };
}
