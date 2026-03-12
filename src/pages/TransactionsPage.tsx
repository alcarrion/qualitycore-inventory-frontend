// src/pages/TransactionsPage.tsx
import React, { useEffect } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import { useShallow } from "zustand/react/shallow";
import { useTransactionsStore, selectTransactionsError } from "../store/transactionsStore";
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
import type { LayoutContext } from "../types/context";
import "../styles/pages/TransactionsPage.css";

function TransactionsPage() {
  const { showError } = useApp();

  const { sales, purchases, movements } = useTransactionsStore(
    useShallow((s) => ({ sales: s.sales, purchases: s.purchases, movements: s.movements }))
  );
  const dataError = useTransactionsStore(selectTransactionsError);

  const { user } = useOutletContext<LayoutContext>();
  const canCreateMovements = PERMISSIONS.CAN_CREATE_MOVEMENT(user?.role);
  const isAdmin = PERMISSIONS.CAN_CREATE_ADJUSTMENT(user?.role);

  const filters = useTransactionFilters();
  const actions = useTransactionActions({ loadTransactions: filters.loadTransactions });

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

      <PurchasesList
        purchases={purchases}
        onViewDetails={actions.modal.setSelectedPurchase}
      />
      <Pagination
        currentPage={filters.currentPagePurchases}
        totalPages={filters.totalPagesPurchases}
        onPageChange={filters.setCurrentPagePurchases}
        totalItems={filters.purchasesCount}
        pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
      />

      <SalesList
        sales={sales}
        onViewDetails={actions.modal.setSelectedSale}
      />
      <Pagination
        currentPage={filters.currentPageSales}
        totalPages={filters.totalPagesSales}
        onPageChange={filters.setCurrentPageSales}
        totalItems={filters.salesCount}
        pageSize={PAGINATION.DEFAULT_PAGE_SIZE}
      />

      <AdjustmentsList movements={movements} />

      <TransactionFormModal
        show={actions.modal.showModal}
        onClose={actions.modal.handleCloseModalAttempt}
        type={actions.modal.type as 'input' | 'output'}
        currentTime={actions.modal.currentTime}
        formContext={actions.formContext}
      />

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

      <InvoiceModal
        show={!!actions.modal.selectedSale}
        type="sale"
        invoice={actions.modal.selectedSale}
        onClose={() => actions.modal.setSelectedSale(null)}
        isAdmin={isAdmin}
        onCorrect={actions.handleCorrection}
      />

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
