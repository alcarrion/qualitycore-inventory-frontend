// src/pages/QuotationPage.js
import React, { useState } from "react";
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
  File,
} from "lucide-react";

import {
  postQuotation,
  getQuotationPDF,
  checkPDFStatus,
} from "../services/api";

import { useDataStore } from "../store/dataStore";
import { useApp } from "../contexts/AppContext";
import { ERRORS, SUCCESS } from "../constants/messages";
import { TIMEOUTS } from "../constants/config";
import { logger } from "../utils/logger";
import "../styles/pages/QuotationPage.css";

export default function QuotationPage() {
  const { showSuccess, showError } = useApp();

  // Zustand store - datos centralizados (ya se cargan en App.js al autenticarse)
  const customers = useDataStore(state => state.customers);
  const products = useDataStore(state => state.products);
  const appConfig = useDataStore(state => state.appConfig);

  const [customer, setCustomer] = useState("");
  const [observations, setObservations] = useState("");
  const [quotedProducts, setQuotedProducts] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

  const handleAddProduct = () => {
    setQuotedProducts(prev => [
      ...prev,
      { product: "", quantity: 1, unit_price: 0, subtotal: 0 },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...quotedProducts];

    if (field === "quantity" || field === "unit_price") {
      const clean = value === "" ? "" : Number(String(value).replace(/^0+(?=\d)/, ""));
      updated[index][field] = clean;
    } else {
      updated[index][field] = value;
    }

    if (field === "product") {
      const productObj = products.find((p) => p.id === Number(value));
      if (productObj) {
        const price = Number(productObj.price) || 0;
        updated[index].unit_price = price;
        updated[index].quantity = 1;
        updated[index].subtotal = price;
      }
    } else {
      const quantity = Number(updated[index].quantity) || 0;
      const price = Number(updated[index].unit_price) || 0;
      updated[index].subtotal = quantity * price;
    }

    setQuotedProducts(updated);
    recalculateTotals(updated);
  };

  const recalculateTotals = (items) => {
    const newSubtotal = items.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
    const taxRate = appConfig.tax_rate.iva;  // Desde el backend
    const newVat = newSubtotal * taxRate;
    const newTotal = newSubtotal + newVat;

    setSubtotal(newSubtotal.toFixed(2));
    setVat(newVat.toFixed(2));
    setTotal(newTotal.toFixed(2));
  };

  // Prevenir que el scroll del mouse cambie los valores numéricos
  const handleWheel = (e) => {
    e.target.blur(); // Quitar el foco del input para prevenir el cambio de valor
  };

  const handleSave = async () => {
    setPdfUrl(null); // Limpiar PDF anterior

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
      vat: Number(vat),
    };

    const res = await postQuotation(payload);

    if (res.ok && res.data?.quotation?.id) {
      showSuccess(SUCCESS.QUOTATION_SAVED);

      // Iniciar generación asíncrona del PDF
      const pdfResponse = await getQuotationPDF(res.data.quotation.id);

      if (pdfResponse.ok && pdfResponse.data?.task_id) {
        const taskId = pdfResponse.data.task_id;
        showSuccess(SUCCESS.QUOTATION_SAVED_GENERATING_PDF);

        // Consultar el estado cada 2 segundos
        const interval = setInterval(async () => {
          const statusResponse = await checkPDFStatus(taskId);

          if (statusResponse.ok && statusResponse.data) {
            const { state, download_url, error } = statusResponse.data;

            if (state === "SUCCESS") {
              clearInterval(interval);
              showSuccess(SUCCESS.PDF_GENERATED);
              setPdfUrl(`${process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")}${download_url}`);
            } else if (state === "FAILURE") {
              clearInterval(interval);
              showError(ERRORS.PDF_GENERATION_FAILED(error));
            }
            // Si está PENDING o STARTED, continuar esperando
          }
        }, TIMEOUTS.POLLING_INTERVAL); // Consultar cada 2 segundos
      }
    } else {
      logger.error("Error al guardar:", res.data);
      showError(ERRORS.QUOTATION_SAVE_FAILED);
    }
  };

  const handleNewQuotation = () => {
    setQuotedProducts([]);
    setCustomer("");
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
            <span className="cotiz-icon-box" style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}>
              <User size={18} />
            </span>
            Información del Cliente
          </div>
          <label className="cotiz-label">Cliente:</label>
          <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="cotiz-select">
            <option value="">-- Selecciona un cliente --</option>
            {customers.map((cli) => (
              <option key={cli.id} value={cli.id}>{cli.name}</option>
            ))}
          </select>
        </div>

        {/* Productos Cotizados */}
        <div className="cotiz-section">
          <div className="cotiz-title">
            <span className="cotiz-icon-box" style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}>
              <Package size={18} />
            </span>
            Productos Cotizados
          </div>
          <button onClick={handleAddProduct} className="cotiz-btn" type="button">
            <Plus size={16} style={{ marginRight: "6px" }} />
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
                <Package size={16} style={{ marginRight: "6px" }} />
                No hay productos agregados
              </div>
            ) : (
              quotedProducts.map((item, index) => (
                <div key={index} className="cotiz-prod-row">
                  <select
                    value={item.product}
                    onChange={(e) => handleProductChange(index, "product", e.target.value)}
                    className="cotiz-select"
                  >
                    <option value="">Producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                    onWheel={handleWheel}
                    className="cotiz-input"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleProductChange(index, "unit_price", e.target.value)}
                    onWheel={handleWheel}
                    className="cotiz-input"
                  />
                  <input type="text" readOnly value={Number(item.subtotal || 0).toFixed(2)} className="cotiz-input" />
                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...quotedProducts];
                      copy.splice(index, 1);
                      setQuotedProducts(copy);
                      recalculateTotals(copy);
                    }}
                    className="cotiz-remove-btn"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="cotiz-summary">
          <h3 className="cotiz-title">
            <span className="cotiz-icon-box" style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}>
              <FileSpreadsheet size={18} />
            </span>
            Resumen de Cotización
          </h3>
          <div className="cotiz-summary-row">
            <span>
              <span className="cotiz-icon-box" style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}>
                <FileSpreadsheet size={16} />
              </span>
              Subtotal:
            </span>
            <span>${subtotal}</span>
          </div>
          <div className="cotiz-summary-row">
            <span>
              <span className="cotiz-icon-box" style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}>
                <Receipt size={16} />
              </span>
              IVA ({(appConfig.tax_rate.iva * 100).toFixed(0)}%):
            </span>
            <span>${vat}</span>
          </div>
          <div className="cotiz-summary-row">
            <span>
              <span className="cotiz-icon-box" style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}>
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
            <span className="cotiz-icon-box" style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}>
              <StickyNote size={18} />
            </span>
            Observaciones
          </div>
          <label className="cotiz-label">Comentarios u observaciones para el cliente:</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows="4"
            className="cotiz-input"
            placeholder="Ejemplo: Incluye garantía de 1 año. Tiempo de entrega: 5 días hábiles."
            style={{ resize: "vertical", minHeight: "100px" }}
          />
        </div>

        {/* Guardar */}
        <button onClick={handleSave} className="cotiz-btn" style={{ width: "100%" }}>
          <Save size={16} style={{ marginRight: "6px" }} />
          Guardar Cotización
        </button>

        {/* PDF */}
        {pdfUrl && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cotiz-pdf-link"
            >
              <File size={16} style={{ marginRight: "6px" }} />
              Ver PDF de la Cotización
            </a>
            <button
              onClick={handleNewQuotation}
              className="cotiz-btn"
              style={{ marginTop: "12px", width: "100%", background: "#10b981" }}
            >
              <Plus size={16} style={{ marginRight: "6px" }} />
              Nueva Cotización
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
