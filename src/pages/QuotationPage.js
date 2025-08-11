// src/pages/QuotationPage.js
import React, { useState, useEffect } from "react";
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
  getCustomers,
  getProducts,
  postQuotation,
  getQuotationPDF,
} from "../services/api";

import "../styles/pages/QuotationPage.css";

export default function QuotationPage() {
  const [cliente, setCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [productosCotizados, setProductosCotizados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClientes();
    fetchProductos();
  }, []);

  const fetchClientes = async () => {
    const res = await getCustomers(); 
    const list = Array.isArray(res.data) ? res.data : [];
    setClientes(list.filter(c => !c.deleted_at));
  };

  const fetchProductos = async () => {
    const res = await getProducts(); 
    const list = Array.isArray(res.data) ? res.data : [];
    setProductos(list.filter(p => !p.deleted_at));
  };

  const handleAddProducto = () => {
    setProductosCotizados(prev => [
      ...prev,
      { product: "", quantity: 1, unit_price: 0, subtotal: 0 },
    ]);
  };

  const handleProductoChange = (index, field, value) => {
    const nuevos = [...productosCotizados];

    if (field === "quantity" || field === "unit_price") {
      const limpio = value === "" ? "" : Number(String(value).replace(/^0+(?=\d)/, ""));
      nuevos[index][field] = limpio;
    } else {
      nuevos[index][field] = value;
    }

    if (field === "product") {
      const productoObj = productos.find((p) => p.id === Number(value));
      if (productoObj) {
        const precio = Number(productoObj.price) || 0;
        nuevos[index].unit_price = precio;
        nuevos[index].quantity = 1;
        nuevos[index].subtotal = precio;
      }
    } else {
      const cantidad = Number(nuevos[index].quantity) || 0;
      const precio = Number(nuevos[index].unit_price) || 0;
      nuevos[index].subtotal = cantidad * precio;
    }

    setProductosCotizados(nuevos);
    recalcularTotales(nuevos);
  };

  const recalcularTotales = (items) => {
    const nuevoSubtotal = items.reduce((acc, p) => acc + (Number(p.subtotal) || 0), 0);
    const nuevoIva = nuevoSubtotal * 0.15;
    const nuevoTotal = nuevoSubtotal + nuevoIva;

    setSubtotal(nuevoSubtotal.toFixed(2));
    setIva(nuevoIva.toFixed(2));
    setTotal(nuevoTotal.toFixed(2));
  };

  const handleGuardar = async () => {
    setMensaje("");

    if (!cliente) {
      setMensaje("❌ Selecciona un cliente.");
      return;
    }
    if (productosCotizados.length === 0) {
      setMensaje("❌ Agrega al menos un producto.");
      return;
    }
    const itemsValidos = productosCotizados.every(
      (p) => p.product && Number(p.quantity) > 0 && Number(p.unit_price) >= 0
    );
    if (!itemsValidos) {
      setMensaje("❌ Revisa cantidades y precios de los productos.");
      return;
    }

    const payload = {
      customer: Number(cliente),
      quoted_products: productosCotizados.map((p) => ({
        product: Number(p.product),
        quantity: Number(p.quantity),
        unit_price: Number(p.unit_price),
      })),
      observations: observaciones,
      vat: Number(iva), 
    };

    const res = await postQuotation(payload); 

    if (res.ok && res.data?.quotation?.id) {
      setMensaje("✅ Cotización guardada correctamente");
      setProductosCotizados([]);
      setCliente("");
      setSubtotal(0);
      setIva(0);
      setTotal(0);
      setObservaciones("");

      const pdfData = await getQuotationPDF(res.data.quotation.id);
      if (pdfData?.url) {
        setPdfUrl(pdfData.url); 
      }
    } else {
      console.error("Error al guardar:", res.data);
      setMensaje("❌ Error al guardar la cotización");
    }
  };

  const handleVerPDF = () => {
    setMensaje("");
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
          <select value={cliente} onChange={(e) => setCliente(e.target.value)} className="cotiz-select">
            <option value="">-- Selecciona un cliente --</option>
            {clientes.map((cli) => (
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
          <button onClick={handleAddProducto} className="cotiz-btn" type="button">
            <Plus size={16} style={{ marginRight: "6px" }} />
            Añadir Producto
          </button>

          {productosCotizados.length > 0 && (
            <div className="cotiz-prod-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio Unitario</span>
              <span>Subtotal</span>
              <span></span>
            </div>
          )}

          <div className="cotiz-prod-list">
            {productosCotizados.length === 0 ? (
              <div className="cotiz-empty">
                <Package size={16} style={{ marginRight: "6px" }} />
                No hay productos agregados
              </div>
            ) : (
              productosCotizados.map((item, index) => (
                <div key={index} className="cotiz-prod-row">
                  <select
                    value={item.product}
                    onChange={(e) => handleProductoChange(index, "product", e.target.value)}
                    className="cotiz-select"
                  >
                    <option value="">Producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleProductoChange(index, "quantity", e.target.value)}
                    className="cotiz-input"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleProductoChange(index, "unit_price", e.target.value)}
                    className="cotiz-input"
                  />
                  <input type="text" readOnly value={Number(item.subtotal || 0).toFixed(2)} className="cotiz-input" />
                  <button
                    type="button"
                    onClick={() => {
                      const copia = [...productosCotizados];
                      copia.splice(index, 1);
                      setProductosCotizados(copia);
                      recalcularTotales(copia);
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
              IVA (15%):
            </span>
            <span>${iva}</span>
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
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows="4"
            className="cotiz-input"
            placeholder="Por ejemplo: Esta cotización es válida por 30 días..."
            style={{ resize: "vertical", minHeight: "100px" }}
          />
        </div>

        {/* Guardar */}
        <button onClick={handleGuardar} className="cotiz-btn" style={{ width: "100%" }}>
          <Save size={16} style={{ marginRight: "6px" }} />
          Guardar Cotización
        </button>

        {/* Mensaje */}
        {mensaje && (
          <p
            style={{
              marginTop: "14px",
              textAlign: "center",
              color: mensaje.startsWith("✅") ? "#127436" : "#c0392b",
              fontWeight: "bold",
              fontSize: "1.11rem",
            }}
          >
            {mensaje}
          </p>
        )}

        {/* PDF */}
        {pdfUrl && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a
              href={pdfUrl}               
              target="_blank"
              rel="noopener noreferrer"
              className="cotiz-pdf-link"
              onClick={handleVerPDF}
            >
              <File size={16} style={{ marginRight: "6px" }} />
              Ver PDF de la Cotización
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
