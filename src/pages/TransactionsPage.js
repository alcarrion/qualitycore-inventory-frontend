// src/pages/TransactionsPage.js
import React, { useEffect } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { useDataStore, selectFirstError } from "../store/dataStore";
import MovementFilters from "./TransactionsPage/MovementFilters";
import PurchasesList from "./TransactionsPage/PurchasesList";
import SalesList from "./TransactionsPage/SalesList";
import AdjustmentsList from "./TransactionsPage/AdjustmentsList";
import TransactionActions from "./TransactionsPage/TransactionActions";
import TransactionFormModal from "./TransactionsPage/TransactionFormModal";
import InvoiceModal from "./TransactionsPage/InvoiceModal";

import { useOutletContext } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { PERMISSIONS } from "../constants/roles";
import { CONFIRM } from "../constants/messages";
import { PAGINATION } from "../constants/config";
import { useTransactionFilters } from "../hooks/useTransactionFilters";
import { useTransactionActions } from "../hooks/useTransactionActions";
import "../styles/pages/TransactionsPage.css";

function TransactionsPage() {
  const { showError } = useApp();

  // Store
  const sales = useDataStore(state => state.sales);
  const purchases = useDataStore(state => state.purchases);
  const movements = useDataStore(state => state.movements);
  const dataError = useDataStore(selectFirstError);

  // Permisos
  const { user } = useOutletContext();
  const canCreateMovements = PERMISSIONS.CAN_CREATE_MOVEMENT(user?.role);
  const isAdmin = PERMISSIONS.CAN_CREATE_ADJUSTMENT(user?.role);

  // Hooks de lógica extraída
  const filters = useTransactionFilters();
  const actions = useTransactionActions({ loadTransactions: filters.loadTransactions });

  // Mostrar error de carga al usuario
  useEffect(() => {
    if (dataError) showError(dataError);
  }, [dataError, showError]);

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h2 className="transactions-title">Gestión de Movimientos</h2>
        <p className="transactions-subtitle">
          Control de entradas y salidas de inventario
        </p>
      </div>

      <MovementFilters
        searchTerm={filters.searchTerm}
        onSearchChange={filters.handleSearchChange}
        startDate={filters.startDate}
        onStartDateChange={filters.setStartDate}
        endDate={filters.endDate}
        onEndDateChange={filters.setEndDate}
        onClearDates={filters.clearDates}
      />

      {canCreateMovements && (
        <TransactionActions
          onAddEntry={() => actions.openModal("input")}
          onAddExit={() => actions.openModal("output")}
        />
      )}

      {/* Entradas - Compras Agrupadas */}
      <PurchasesList
        purchases={purchases}
        onViewDetails={actions.modal.setSelectedPurchase}
        searchTerm={filters.searchTerm}
      />
      {!filters.searchTerm.trim() && (
        <Pagination
          currentPage={filters.currentPagePurchases}
          totalPages={filters.totalPagesPurchases}
          onPageChange={filters.setCurrentPagePurchases}
          totalItems={filters.purchasesCount}
          pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
        />
      )}

      {/* Salidas - Ventas Agrupadas */}
      <SalesList
        sales={sales}
        onViewDetails={actions.modal.setSelectedSale}
        searchTerm={filters.searchTerm}
      />
      {!filters.searchTerm.trim() && (
        <Pagination
          currentPage={filters.currentPageSales}
          totalPages={filters.totalPagesSales}
          onPageChange={filters.setCurrentPageSales}
          totalItems={filters.salesCount}
          pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
        />
      )}

      {/* Historial de ajustes y correcciones */}
      <AdjustmentsList movements={movements} searchTerm={filters.searchTerm} />

      {/* Modal de formulario */}
      <TransactionFormModal
        show={actions.modal.showModal}
        onClose={actions.modal.handleCloseModalAttempt}
        type={actions.modal.type}
        currentTime={actions.modal.currentTime}
        // Dropdowns como objetos
        supplierDropdown={actions.supplierDropdown}
        customerDropdown={actions.customerDropdown}
        productDropdown={actions.productDropdown}
        // Selección de entidades
        selectedSupplier={actions.selectedSupplier}
        selectedCustomer={actions.selectedCustomer}
        onSupplierChange={actions.handleSupplierChange}
        onCustomerChange={actions.setSelectedCustomer}
        onSelectSupplier={actions.selectSupplier}
        onSelectCustomer={actions.selectCustomer}
        onSelectProduct={actions.selectProduct}
        // Form data
        formData={actions.formData}
        onFormDataChange={actions.handleInputChange}
        onWheel={actions.handleWheel}
        // Carrito
        cart={actions.cart}
        onAddToCart={actions.handleAddToCart}
        onRemoveFromCart={actions.cartRemoveFromCart}
        onUpdateCartQuantity={actions.handleUpdateCartQuantity}
        totalPrice={actions.calculateTotal()}
        // Submit
        onSubmit={actions.handleSubmit}
      />

      {/* Diálogo de confirmación para cerrar modal */}
      <ConfirmDialog
        isOpen={actions.modal.showConfirmClose}
        onClose={actions.modal.handleCancelClose}
        onConfirm={actions.handleConfirmClose}
        title={CONFIRM.CLOSE_WITHOUT_SAVE_TITLE}
        message={CONFIRM.CLOSE_WITHOUT_SAVE}
        confirmText="Cerrar"
        cancelText="Continuar editando"
        type="warning"
      />

      {/* Modal de detalle de venta */}
      <InvoiceModal
        show={!!actions.modal.selectedSale}
        type="sale"
        invoice={actions.modal.selectedSale}
        onClose={() => actions.modal.setSelectedSale(null)}
        isAdmin={isAdmin}
        onCorrect={actions.handleCorrection}
      />

      {/* Modal de detalle de compra */}
      <InvoiceModal
        show={!!actions.modal.selectedPurchase}
        type="purchase"
        invoice={actions.modal.selectedPurchase}
        onClose={() => actions.modal.setSelectedPurchase(null)}
        isAdmin={isAdmin}
        onCorrect={actions.handleCorrection}
      />
    </div>
  );
}

export default TransactionsPage;
