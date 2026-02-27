// src/pages/QuotationPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Package,
  Plus,
  X,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  StickyNote,
  Save,
  FileDown,
} from "lucide-react";

import {
  postQuotation,
  getQuotationPDF,
  checkPDFStatus,
} from "../services/api";

import { useDataStore } from "../store/dataStore";
import { useApp } from "../contexts/AppContext";
import { usePolling, POLLING_TIMEOUT } from "../hooks/usePolling";
import { useDropdownSearch } from "../hooks/useDropdownSearch";
import SearchableDropdown from "../components/SearchableDropdown";
import { ERRORS, SUCCESS } from "../constants/messages";
import { logger } from "../utils/logger";
import type { Product, Customer } from "../types/models";
import "../styles/pages/QuotationPage.css";

interface QuotedProduct {
  product: string;
  quantity: number | string;
  unit_price: number | string;
  subtotal: number;
}

export default function QuotationPage() {
  const { showSuccess, showError } = useApp();

  const customers = useDataStore(state => state.customers);
  const products = useDataStore(state => state.products);
  const appConfig = useDataStore(state => state.appConfig);

  const [customer, setCustomer] = useState("");
  const [observations, setObservations] = useState("");
  const [quotedProducts, setQuotedProducts] = useState<QuotedProduct[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const customerDropdown = useDropdownSearch<Customer>(customers);

  const [subtotal, setSubtotal] = useState<number>(0);
  const [vat, setVat] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const pdfPolling = usePolling(checkPDFStatus);

  useEffect(() => {
    if (pdfPolling.result) {
      showSuccess(SUCCESS.PDF_GENERATED);
      const apiUrl = process.env.REACT_APP_API_URL ?? "";
      setPdfUrl(`${apiUrl.replace(/\/api\/?$/, "")}${pdfPolling.result}`);
    }
  }, [pdfPolling.result, showSuccess]);

  useEffect(() => {
    if (pdfPolling.error) {
      if (pdfPolling.error === POLLING_TIMEOUT) {
        showError("Tiempo de espera agotado generando el PDF. Intenta de nuevo.");
      } else {
        showError(ERRORS.PDF_GENERATION_FAILED(pdfPolling.error));
      }
    }
  }, [pdfPolling.error, showError]);

  const recalculateTotals = useCallback((items: QuotedProduct[]) => {
    const newSubtotal = items.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
    const taxRate = appConfig.tax_rate.iva;
    const newVat = newSubtotal * taxRate;
    const newTotal = newSubtotal + newVat;
    setSubtotal(parseFloat(newSubtotal.toFixed(2)));
    setVat(parseFloat(newVat.toFixed(2)));
    setTotal(parseFloat(newTotal.toFixed(2)));
  }, [appConfig.tax_rate.iva]);

  const handleAddProduct = () => {
    setQuotedProducts(prev => [
      ...prev,
      { product: "", quantity: 1, unit_price: 0, subtotal: 0 },
    ]);
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
      const productObj = products.find((p) => p.id === Number(value));
      if (productObj) {
        const price = Number(productObj.price) || 0;
        updated[index] = { ...updated[index], product: value, unit_price: price, quantity: 1, subtotal: price };
      } else {
        updated[index] = { ...updated[index], product: value };
      }
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
    setPdfUrl(null);
    pdfPolling.stop();

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
        const pdfResponse = await getQuotationPDF(quotationId);

        if (pdfResponse.ok && (pdfResponse.data as { task_id?: string } | null)?.task_id) {
          showSuccess(SUCCESS.QUOTATION_SAVED_GENERATING_PDF);
          pdfPolling.start((pdfResponse.data as { task_id: string }).task_id);
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
    pdfPolling.stop();
    setQuotedProducts([]);
    setCustomer("");
    customerDropdown.clear();
    setSubtotal(0);
    setVat(0);
    setTotal(0);
    setObservations("");
    setPdfUrl(null);
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
              customerDropdown.select(cli.name);
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
                  products={products}
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
        <button onClick={handleSave} className="cotiz-btn cotiz-btn--full" disabled={pdfPolling.isPolling}>
          <Save size={16} />
          {pdfPolling.isPolling ? "Generando PDF..." : "Guardar Cotización"}
        </button>

        {/* PDF de última cotización */}
        {pdfUrl && (
          <a
            href={pdfUrl}
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

interface RowProps {
  item: QuotedProduct;
  index: number;
  products: Product[];
  onProductChange: (index: number, field: string, value: string) => void;
  onRemove: () => void;
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => void;
}

function QuotedProductRow({ item, index, products, onProductChange, onRemove, onWheel }: RowProps) {
  const productDropdown = useDropdownSearch<Product>(products);

  const handleSelectProduct = useCallback((product: Product) => {
    productDropdown.select(product.name);
    onProductChange(index, "product", String(product.id));
  }, [productDropdown, onProductChange, index]);

  const renderProductItem = useCallback((p: Product) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: "500" }}>{p.name}</div>
        <div style={{ fontSize: "0.85em", color: "var(--text-secondary)" }}>
          Código: {p.code}
        </div>
      </div>
      <div style={{ textAlign: "right", marginLeft: "12px" }}>
        <div style={{ fontSize: "0.85em", fontWeight: "500", color: "var(--primary-color)" }}>
          ${parseFloat(String(p.price)).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: "0.75em", color: "var(--text-secondary)" }}>
          Stock: {p.current_stock}
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="cotiz-prod-row">
      <SearchableDropdown
        dropdown={productDropdown}
        onSelect={handleSelectProduct}
        onDeselect={() => onProductChange(index, "product", "")}
        placeholder="Buscar producto..."
        emptyMessage="No se encontraron productos"
        maxItems={10}
        renderItem={renderProductItem}
        className="cotiz-prod-search"
      />
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => onProductChange(index, "quantity", e.target.value)}
        onWheel={onWheel}
        className="cotiz-input"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={item.unit_price}
        onChange={(e) => onProductChange(index, "unit_price", e.target.value)}
        onWheel={onWheel}
        className="cotiz-input"
      />
      <input type="text" readOnly value={Number(item.subtotal || 0).toFixed(2)} className="cotiz-input" />
      <button type="button" onClick={onRemove} className="cotiz-remove-btn">
        <X size={18} />
      </button>
    </div>
  );
}
