// src/pages/TransactionsPage.js
import React, { useState, useEffect, useMemo } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { postSale, postPurchase } from "../services/api";
import { useDataStore } from "../store/dataStore";
import { useCart } from "../hooks/useCart";
import MovementFilters from "./TransactionsPage/MovementFilters";
import PurchasesList from "./TransactionsPage/PurchasesList";
import SalesList from "./TransactionsPage/SalesList";
import TransactionActions from "./TransactionsPage/TransactionActions";
import TransactionFormModal from "./TransactionsPage/TransactionFormModal";
import InvoiceModal from "./TransactionsPage/InvoiceModal";

import { useApp } from "../contexts/AppContext";
import { PERMISSIONS } from "../constants/roles";
import { ERRORS, SUCCESS, CONFIRM } from "../constants/messages";
import { PAGINATION } from "../constants/config";
import "../styles/pages/TransactionsPage.css";

function TransactionsPage() {
  const { showSuccess, showError } = useApp();

  // Zustand store - estado centralizado
  const sales = useDataStore(state => state.sales);
  const purchases = useDataStore(state => state.purchases);
  const products = useDataStore(state => state.products);
  const customers = useDataStore(state => state.customers);
  const suppliers = useDataStore(state => state.suppliers);
  const dataError = useDataStore(state => state.error);
  const fetchAll = useDataStore(state => state.fetchAll);

  // ✅ FASE 4.1: Usar hook para lógica del carrito
  const {
    cart,
    selectedCustomer,
    selectedSupplier,
    setSelectedCustomer,
    setSelectedSupplier,
    addToCart: cartAddToCart,
    removeFromCart: cartRemoveFromCart,
    updateCartQuantity: cartUpdateQuantity,
    clearCart: cartClearCart,
    calculateTotal
  } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [type, setType] = useState("input");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSale, setSelectedSale] = useState(null); // Para mostrar modal de detalle de venta
  const [selectedPurchase, setSelectedPurchase] = useState(null); // Para mostrar modal de detalle de compra
  const [currentPagePurchases, setCurrentPagePurchases] = useState(1);
  const [currentPageSales, setCurrentPageSales] = useState(1);

  // Actualizar el reloj cada segundo cuando el modal está abierto
  useEffect(() => {
    let interval;
    if (showModal) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showModal]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.formGroup')) {
        setShowCustomerDropdown(false);
        setShowSupplierDropdown(false);
        setShowProductDropdown(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  // ✅ FASE 1.2: Mostrar error de carga al usuario
  useEffect(() => {
    if (dataError) {
      showError(dataError);
    }
  }, [dataError, showError]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPagePurchases(1);
    setCurrentPageSales(1);
  }, [searchTerm, startDate, endDate]);

  // Estado para entradas (sin cambios)
  const [formData, setFormData] = useState({
    quantity: "",
    product: "",
    customer: "",
  });

  // Estados para búsqueda con autocompletado
  const [customerSearch, setCustomerSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const canCreateMovements = PERMISSIONS.CAN_CREATE_MOVEMENT(user?.role);

  // ✅ FASE 1.1: Fetch functions eliminadas - ahora las maneja useTransactionsData hook

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si es el campo de cantidad, validar que sea un número positivo
    if (name === "quantity") {
      const numValue = Number(value);
      // Solo permitir números positivos (mayores a 0)
      if (value === "" || (numValue > 0 && !isNaN(numValue))) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Prevenir que el scroll del mouse cambie los valores numéricos
  const handleWheel = (e) => {
    e.target.blur(); // Quitar el foco del input para prevenir el cambio de valor
  };

  // ✅ FASE 4.1: Wrappers que adaptan la API del useCart hook al uso actual
  const handleAddToCart = () => {
    if (type === "input" && !selectedSupplier) {
      showError(ERRORS.SELECT_SUPPLIER_FIRST);
      return;
    }
    if (type === "output" && !selectedCustomer) {
      showError(ERRORS.SELECT_CUSTOMER_FIRST);
      return;
    }
    if (!formData.product || !formData.quantity) {
      showError(ERRORS.SELECT_PRODUCT_AND_QUANTITY);
      return;
    }

    const selectedProduct = products.find(
      (p) => p.id === Number(formData.product)
    );
    if (!selectedProduct) {
      showError(ERRORS.PRODUCT_NOT_FOUND);
      return;
    }

    const success = cartAddToCart(selectedProduct, formData.quantity, type, showError);
    if (success) {
      setFormData({ ...formData, product: "", quantity: "" });
      setProductSearch("");
      setShowProductDropdown(false);
    }
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity < 0) return;
    if (newQuantity === 0) {
      cartRemoveFromCart(productId);
      return;
    }
    cartUpdateQuantity(productId, newQuantity, type, showError);
  };

  const handleClearCart = () => {
    cartClearCart();
    setCustomerSearch("");
    setSupplierSearch("");
    setProductSearch("");
    setShowCustomerDropdown(false);
    setShowSupplierDropdown(false);
    setShowProductDropdown(false);
    setFormData({ quantity: "", product: "", customer: "" });
  };

  // Funciones para manejar cierre del modal
  const handleCloseModalAttempt = () => {
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowModal(false);
    setShowConfirmClose(false);
    handleClearCart();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  // Helper: filtrar por rango de fechas
  const matchesDateRange = (dateStr) => {
    if (!startDate && !endDate) return true;
    const d = new Date(dateStr);
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (startDate) {
      const s = new Date(startDate + "T00:00:00");
      if (dateOnly < new Date(s.getFullYear(), s.getMonth(), s.getDate())) return false;
    }
    if (endDate) {
      const e = new Date(endDate + "T23:59:59");
      if (dateOnly > new Date(e.getFullYear(), e.getMonth(), e.getDate())) return false;
    }
    return true;
  };

  // Helper: ordenar por relevancia de búsqueda
  const sortBySearch = (search) => (a, b) =>
    search.trim() === "" ? b.id - a.id : a.name.localeCompare(b.name);

  // Filtrar y ordenar clientes según búsqueda
  const filteredCustomers = customers
    .filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
    .sort(sortBySearch(customerSearch));

  // Filtrar y ordenar proveedores según búsqueda
  const filteredSuppliers = suppliers
    .filter((s) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))
    .sort(sortBySearch(supplierSearch));

  // Filtrar y ordenar productos según búsqueda
  const filteredProducts = products
    .filter((p) => {
      // Filtrar por nombre
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());

      // Si es entrada (input) y hay proveedor seleccionado, filtrar por proveedor
      if (type === "input" && selectedSupplier) {
        return matchesSearch && p.supplier === Number(selectedSupplier);
      }

      return matchesSearch;
    })
    .map((p) => {
      // Calcular stock disponible restando lo que está en el carrito (solo para salidas)
      if (type === "output") {
        const cartItem = cart.find((item) => item.product.id === p.id);
        const availableStock = cartItem ? p.current_stock - cartItem.quantity : p.current_stock;
        return { ...p, availableStock };
      }
      return p;
    })
    .sort(sortBySearch(productSearch));

  // Seleccionar cliente del autocompletado
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer.id);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  // Limpiar carrito cuando se cambia o borra el proveedor
  const handleSupplierChange = (newSupplierId) => {
    if (cart.length > 0 && selectedSupplier && selectedSupplier !== newSupplierId) {
      cartClearCart();
      setProductSearch("");
      setFormData({ ...formData, product: "", quantity: "" });
    }
    setSelectedSupplier(newSupplierId);
  };

  // Seleccionar proveedor del autocompletado
  const selectSupplier = (supplier) => {
    handleSupplierChange(supplier.id);
    setSupplierSearch(supplier.name);
    setShowSupplierDropdown(false);
  };

  // Seleccionar producto del autocompletado
  const selectProduct = (product) => {
    setFormData({ ...formData, product: product.id });
    const displayStock = product.availableStock ?? product.current_stock;
    setProductSearch(`${product.name} (Stock: ${displayStock})`);
    setShowProductDropdown(false);
    setShowCustomerDropdown(false);
    setShowSupplierDropdown(false);
  };

  const handleSubmit = async () => {
    const isPurchase = type === "input";
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

    const requestData = isPurchase
      ? { supplier: Number(selectedSupplier), items }
      : { customer: Number(selectedCustomer), items };

    const resp = isPurchase
      ? await postPurchase(requestData)
      : await postSale(requestData);

    if (resp.ok) {
      await fetchAll();
      window.dispatchEvent(new Event("recargarInventario"));
      setShowModal(false);
      handleClearCart();
      const action = isPurchase ? "Compra" : "Venta";
      showSuccess(SUCCESS.TRANSACTION_CREATED(action, cart.length));
    } else {
      const entityError = isPurchase ? resp.data?.supplier?.[0] : resp.data?.customer?.[0];
      const transactionType = isPurchase ? "compra" : "venta";
      showError(resp.data?.detail || entityError || resp.data?.items?.[0] || ERRORS.TRANSACTION_FAILED(transactionType));
      await fetchAll();
    }
  };

  // Función para filtrar ventas por término de búsqueda y fechas
  const filterSales = (sales) => {
    return sales.filter((s) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches = (s.customer_name || "").toLowerCase().includes(term) ||
          (s.user_name || "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      return matchesDateRange(s.date);
    });
  };

  // Función para filtrar compras por término de búsqueda y fechas
  const filterPurchases = (purchases) => {
    return purchases.filter((p) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches = (p.supplier_name || "").toLowerCase().includes(term) ||
          (p.user_name || "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      return matchesDateRange(p.date);
    });
  };

  // Aplicar filtros con useMemo para optimización
  const filteredPurchases = useMemo(() => filterPurchases(purchases), [purchases, searchTerm, startDate, endDate]);
  const filteredSales = useMemo(() => filterSales(sales), [sales, searchTerm, startDate, endDate]);

  // Calcular paginación para compras
  const totalPagesPurchases = Math.ceil(filteredPurchases.length / PAGINATION.DEFAULT_PAGE_SIZE);
  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPagePurchases - 1) * PAGINATION.DEFAULT_PAGE_SIZE;
    return filteredPurchases.slice(startIndex, startIndex + PAGINATION.DEFAULT_PAGE_SIZE);
  }, [filteredPurchases, currentPagePurchases]);

  // Calcular paginación para ventas
  const totalPagesSales = Math.ceil(filteredSales.length / PAGINATION.DEFAULT_PAGE_SIZE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPageSales - 1) * PAGINATION.DEFAULT_PAGE_SIZE;
    return filteredSales.slice(startIndex, startIndex + PAGINATION.DEFAULT_PAGE_SIZE);
  }, [filteredSales, currentPageSales]);

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2 className="transactions-title">Gestión de Movimientos</h2>
        <p className="transactions-subtitle">
          Control de entradas y salidas de inventario
        </p>
      </div>

      <MovementFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onClearDates={() => {
          setStartDate("");
          setEndDate("");
        }}
      />

      {canCreateMovements && (
        <TransactionActions
          onAddEntry={() => {
            setType("input");
            handleClearCart();
            setShowModal(true);
          }}
          onAddExit={() => {
            setType("output");
            handleClearCart();
            setShowModal(true);
          }}
        />
      )}

      {/* Entradas - Compras Agrupadas */}
      <PurchasesList
        purchases={paginatedPurchases}
        onViewDetails={setSelectedPurchase}
      />
      <Pagination
        currentPage={currentPagePurchases}
        totalPages={totalPagesPurchases}
        onPageChange={setCurrentPagePurchases}
        totalItems={filteredPurchases.length}
        pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
      />

      {/* Salidas - Ventas Agrupadas */}
      <SalesList
        sales={paginatedSales}
        onViewDetails={setSelectedSale}
      />
      <Pagination
        currentPage={currentPageSales}
        totalPages={totalPagesSales}
        onPageChange={setCurrentPageSales}
        totalItems={filteredSales.length}
        pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
      />

      {/* Modal - ✅ FASE 3.1: Usar componente TransactionFormModal */}
      <TransactionFormModal
        show={showModal}
        onClose={handleCloseModalAttempt}
        type={type}
        currentTime={currentTime}

        // Proveedor
        supplierSearch={supplierSearch}
        onSupplierSearchChange={setSupplierSearch}
        showSupplierDropdown={showSupplierDropdown}
        onShowSupplierDropdownChange={setShowSupplierDropdown}
        selectedSupplier={selectedSupplier}
        onSelectSupplier={handleSupplierChange}
        onSupplierSelect={selectSupplier}
        filteredSuppliers={filteredSuppliers}

        // Cliente
        customerSearch={customerSearch}
        onCustomerSearchChange={setCustomerSearch}
        showCustomerDropdown={showCustomerDropdown}
        onShowCustomerDropdownChange={setShowCustomerDropdown}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onCustomerSelect={selectCustomer}
        filteredCustomers={filteredCustomers}

        // Productos
        productSearch={productSearch}
        onProductSearchChange={setProductSearch}
        showProductDropdown={showProductDropdown}
        onShowProductDropdownChange={setShowProductDropdown}
        onProductSelect={selectProduct}
        filteredProducts={filteredProducts}

        // Form data
        formData={formData}
        onFormDataChange={handleInputChange}
        onWheel={handleWheel}

        // Carrito
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={cartRemoveFromCart}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        totalPrice={calculateTotal()}

        // Submit
        onSubmit={handleSubmit}
      />

      {/* Diálogo de confirmación para cerrar modal */}
      <ConfirmDialog
        isOpen={showConfirmClose}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title={CONFIRM.CLOSE_WITHOUT_SAVE_TITLE}
        message={CONFIRM.CLOSE_WITHOUT_SAVE}
        confirmText="Cerrar"
        cancelText="Continuar editando"
        type="warning"
      />

      {/* Modal de detalle de venta (tipo factura) - ✅ FASE 3.2: Usar InvoiceModal genérico */}
      <InvoiceModal
        show={!!selectedSale}
        type="sale"
        invoice={selectedSale}
        onClose={() => setSelectedSale(null)}
      />

      {/* Modal de detalle de compra (tipo factura) - ✅ FASE 3.2: Usar InvoiceModal genérico */}
      <InvoiceModal
        show={!!selectedPurchase}
        type="purchase"
        invoice={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />
    </div>
  );
}

export default TransactionsPage;
