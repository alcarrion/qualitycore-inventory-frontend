// src/pages/QuotationPage.tsx
import React, { useState } from "react";
import {
  User,
  Package,
  Plus,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  StickyNote,
  Save,
  FileDown,
} from "lucide-react";

import { postQuotation } from "../services/api";
import { useAppConfigStore } from "../store/appConfigStore";
import { useApp } from "../contexts/AppContext";
import { useLazyDropdown } from "../hooks/useLazyDropdown";
import { useCustomerSearch } from "../hooks/useCustomerSearch";
import { useQuotationTotals } from "../hooks/useQuotationTotals";
import { useQuotationPDF } from "../hooks/useQuotationPDF";
import { QuotedProductRow } from "../components/QuotedProductRow";
import SearchableDropdown from "../components/SearchableDropdown";
import { ERRORS, SUCCESS } from "../constants/messages";
import { logger } from "../utils/logger";
import type { QuotedProduct } from "../components/QuotedProductRow";
import type { Customer } from "../types/models";
import "../styles/pages/QuotationPage.css";

export default function QuotationPage() {
  const { showSuccess, showError } = useApp();

  const appConfig = useAppConfigStore(state => state.appConfig);

  const taxRate = appConfig.tax_rate.iva;
  const { subtotal, vat, total, recalculateTotals, resetTotals } = useQuotationTotals(taxRate);
  const pdf = useQuotationPDF();

  const [customer, setCustomer] = useState("");
  const [observations, setObservations] = useState("");
  const [quotedProducts, setQuotedProducts] = useState<QuotedProduct[]>([]);

  // Búsqueda lazy de clientes: solo consulta el servidor cuando el usuario escribe
  const [customerSearchText, setCustomerSearchText] = useState("");
  const { customers: serverCustomers } = useCustomerSearch(customerSearchText);
  const {
    dropdown: customerDropdown,
    confirmSelection: confirmCustomer,
    clear: clearCustomer,
  } = useLazyDropdown<Customer>(serverCustomers, setCustomerSearchText);

  const handleAddProduct = () => {
    setQuotedProducts(prev => [
      ...prev,
      { product: "", quantity: 1, unit_price: 0, subtotal: 0 },
    ]);
  };

  const handleProductSelect = (index: number, productId: string, price: number) => {
    const updated = [...quotedProducts];
    updated[index] = { ...updated[index], product: productId, unit_price: price, quantity: 1, subtotal: price };
    setQuotedProducts(updated);
    recalculateTotals(updated);
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    const updated = [...quotedProducts];

    if (field === "quantity") {
      const clean: number | string = value === "" ? "" : Number(String(value).replace(/^0+(?=\d)/, ""));
      updated[index] = { ...updated[index], quantity: clean };
    } else if (field === "unit_price") {
      const clean: number | string = value === "" ? "" : Number(String(value).replace(/^0+(?=\d)/, ""));
      updated[index] = { ...updated[index], unit_price: clean };
    } else if (field === "product") {
      // Caso deselección: limpiar el ID del producto
      updated[index] = { ...updated[index], product: value };
    }

    if (field !== "product") {
      const quantity = Number(updated[index].quantity) || 0;
      const price = Number(updated[index].unit_price) || 0;
      updated[index] = { ...updated[index], subtotal: quantity * price };
    }

    setQuotedProducts(updated);
    recalculateTotals(updated);
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const handleSave = async () => {
    pdf.resetPDF();

    if (!customer) {
      showError(ERRORS.SELECT_CUSTOMER);
      return;
    }
    if (quotedProducts.length === 0) {
      showError(ERRORS.ADD_AT_LEAST_ONE_PRODUCT);
      return;
    }
    const validItems = quotedProducts.every(
      (p) => p.product && Number(p.quantity) > 0 && Number(p.unit_price) >= 0
    );
    if (!validItems) {
      showError(ERRORS.CHECK_QUANTITIES_AND_PRICES);
      return;
    }

    const payload = {
      customer: Number(customer),
      quoted_products: quotedProducts.map((p) => ({
        product: Number(p.product),
        quantity: Number(p.quantity),
        unit_price: Number(p.unit_price),
      })),
      observations: observations,
      vat: vat,
    };

    try {
      const res = await postQuotation(payload);

      if (res.ok && res.data?.quotation?.id) {
        const quotationId = res.data.quotation.id;
        const started = await pdf.startPDFGeneration(quotationId);
        if (started) {
          showSuccess(SUCCESS.QUOTATION_SAVED_GENERATING_PDF);
        } else {
          showSuccess(SUCCESS.QUOTATION_SAVED);
          showError(ERRORS.PDF_GENERATION_FAILED("No se pudo iniciar la generación del PDF."));
        }
      } else {
        logger.error("Error al guardar:", res.data);
        showError(ERRORS.QUOTATION_SAVE_FAILED);
      }
    } catch (err) {
      logger.error("Error inesperado al guardar cotización:", err);
      showError(ERRORS.QUOTATION_SAVE_FAILED);
    }
  };

  const handleNewQuotation = () => {
    pdf.resetPDF();
    setQuotedProducts([]);
    setCustomer("");
    clearCustomer();
    resetTotals();
    setObservations("");
  };

  return (
    <div className="cotiz-bg">
      <div className="cotiz-main">
        {/* Cliente */}
        <div className="cotiz-section">
          <div className="cotiz-title">
            <span className="cotiz-icon-box">
              <User size={18} />
            </span>
            Información del Cliente
          </div>
          <SearchableDropdown
            label="Cliente:"
            icon={<User size={16} />}
            dropdown={customerDropdown}
            onSelect={(cli) => {
              setCustomer(String(cli.id));
              confirmCustomer(cli, cli.name);
            }}
            onDeselect={() => setCustomer("")}
            placeholder="Buscar cliente por nombre..."
            emptyMessage="No se encontraron clientes"
            maxItems={10}
          />
        </div>

        {/* Productos Cotizados */}
        <div className="cotiz-section">
          <div className="cotiz-title">
            <span className="cotiz-icon-box">
              <Package size={18} />
            </span>
            Productos Cotizados
          </div>
          <button onClick={handleAddProduct} className="cotiz-btn" type="button">
            <Plus size={16} />
            Añadir Producto
          </button>

          {quotedProducts.length > 0 && (
            <div className="cotiz-prod-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio Unitario</span>
              <span>Subtotal</span>
              <span></span>
            </div>
          )}

          <div className="cotiz-prod-list">
            {quotedProducts.length === 0 ? (
              <div className="cotiz-empty">
                <Package size={16} />
                No hay productos agregados
              </div>
            ) : (
              quotedProducts.map((item, index) => (
                <QuotedProductRow
                  key={index}
                  item={item}
                  index={index}
                  onProductSelect={handleProductSelect}
                  onProductChange={handleProductChange}
                  onRemove={() => {
                    const copy = [...quotedProducts];
                    copy.splice(index, 1);
                    setQuotedProducts(copy);
                    recalculateTotals(copy);
                  }}
                  onWheel={handleWheel}
                />
              ))
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="cotiz-summary">
          <h3 className="cotiz-title">
            <span className="cotiz-icon-box">
              <FileSpreadsheet size={18} />
            </span>
            Resumen de Cotización
          </h3>
          <div className="cotiz-summary-row">
            <span>
              <span className="cotiz-icon-box">
                <FileSpreadsheet size={16} />
              </span>
              Subtotal:
            </span>
            <span>${subtotal}</span>
          </div>
          <div className="cotiz-summary-row">
            <span>
              <span className="cotiz-icon-box">
                <Receipt size={16} />
              </span>
              IVA ({(appConfig.tax_rate.iva * 100).toFixed(0)}%):
            </span>
            <span>${vat}</span>
          </div>
          <div className="cotiz-summary-row">
            <span>
              <span className="cotiz-icon-box">
                <CreditCard size={16} />
              </span>
              Total:
            </span>
            <span>${total}</span>
          </div>
        </div>

        {/* Observaciones */}
        <div className="cotiz-section">
          <div className="cotiz-title">
            <span className="cotiz-icon-box">
              <StickyNote size={18} />
            </span>
            Observaciones
          </div>
          <label className="cotiz-label">Comentarios u observaciones para el cliente:</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={4}
            className="cotiz-input"
            placeholder="Ejemplo: Incluye garantía de 1 año. Tiempo de entrega: 5 días hábiles."
          />
        </div>

        {/* Guardar */}
        <button
          onClick={handleSave}
          className="cotiz-btn cotiz-btn--full"
          disabled={pdf.isPolling}
        >
          <Save size={16} />
          {pdf.isPolling ? `Generando PDF... (${pdf.pdfElapsedSeconds}s)` : "Guardar Cotización"}
        </button>

        {/* PDF de última cotización */}
        {pdf.pdfUrl && (
          <a
            href={pdf.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cotiz-pdf-link cotiz-btn--full"
            onClick={handleNewQuotation}
          >
            <FileDown size={16} />
            Ver PDF de la Cotización
          </a>
        )}
      </div>
    </div>
  );
}
