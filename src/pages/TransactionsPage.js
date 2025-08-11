// src/pages/TransactionsPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import {
  getMovements,
  postMovement,
  getProducts,
  getCustomers,
} from "../services/api";

import {
  PackagePlus,
  PackageMinus,
  ArrowUpToLine,
  Boxes,
  CalendarClock,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

import "../styles/pages/TransactionsPage.css";

function TransactionsPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState("input");
  const [mensaje, setMensaje] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    quantity: "",
    product: "",
    customer: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const canCreateMovimientos = user?.role === "Administrator";

  useEffect(() => {
    fetchMovimientos();
    fetchProductos();
    fetchClientes();
  }, []);

  const fetchMovimientos = async () => {
    const res = await getMovements(); 
    setMovimientos(Array.isArray(res.data) ? res.data : []);
  };

  const fetchProductos = async () => {
    const res = await getProducts(); 
    const list = Array.isArray(res.data) ? res.data : [];
    setProductos(list.filter((p) => p.status === "Activo" && !p.deleted_at));
  };

  const fetchClientes = async () => {
    const res = await getCustomers(); 
    const list = Array.isArray(res.data) ? res.data : [];
    setClientes(list.filter((c) => !c.deleted_at));
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.date ||
      !formData.quantity ||
      !formData.product ||
      (tipo === "output" && !formData.customer)
    ) {
      setMensaje("❌ Por favor completa todos los campos obligatorios.");
      setTimeout(() => setMensaje(""), 4000);
      return;
    }

    const productoSeleccionado = productos.find(
      (p) => p.id === Number(formData.product)
    );
    const cantidad = Number(formData.quantity);

    if (
      tipo === "output" &&
      productoSeleccionado &&
      cantidad > productoSeleccionado.current_stock
    ) {
      setMensaje("❌ No hay suficiente stock disponible para esta salida.");
      setTimeout(() => setMensaje(""), 4000);
      return;
    }

    const movimiento = {
      date: formData.date,
      quantity: cantidad,
      product: Number(formData.product),
      movement_type: tipo,
      ...(tipo === "output" ? { customer: Number(formData.customer) } : {}),
    };

    const resp = await postMovement(movimiento); 

    if (resp.ok) {
      await fetchMovimientos();
      await fetchProductos();
      window.dispatchEvent(new Event("recargarInventario"));
      setShowModal(false);
      setFormData({ date: "", quantity: "", product: "", customer: "" });
      setMensaje("✅ Movimiento guardado con éxito.");
      setTimeout(() => setMensaje(""), 3000);
    } else {
      const data = resp.data || {};
      let errorMsg = "Ocurrió un error al guardar el movimiento.";
      if (data.detail) errorMsg += ` ${data.detail}`;
      else if (data.message) errorMsg += ` ${data.message}`;
      else errorMsg += " Revisa que todos los campos estén completos y válidos.";
      setMensaje(`❌ ${errorMsg}`);
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  const entradas = movimientos.filter((m) => m.movement_type === "input");
  const salidas = movimientos.filter((m) => m.movement_type === "output");

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1 className="transactions-title">Gestión de Movimientos</h1>
        <p className="transactions-subtitle">
          Control de entradas y salidas de inventario
        </p>
      </div>

      {mensaje && (
        <div
          className={`mensaje ${
            mensaje.startsWith("✅") ? "mensajeOk" : "mensajeError"
          }`}
        >
          {mensaje.startsWith("✅") ? (
            <>
              <CheckCircle size={18} style={{ marginRight: "8px" }} />
              {mensaje.replace("✅", "")}
            </>
          ) : (
            <>
              <XCircle size={18} style={{ marginRight: "8px" }} />
              {mensaje.replace("❌", "")}
            </>
          )}
        </div>
      )}

      {canCreateMovimientos && (
        <div className="botonesAccion">
          <button
            onClick={() => {
              setTipo("input");
              setShowModal(true);
            }}
            className="btn entradaBtn"
          >
            <PackagePlus size={18} />
            Añadir Entrada
          </button>
          <button
            onClick={() => {
              setTipo("output");
              setShowModal(true);
            }}
            className="btn salidaBtn"
          >
            <PackageMinus size={18} />
            Añadir Salida
          </button>
        </div>
      )}

      {/* Entradas */}
      <div>
        <h2 className="table-title">Entradas</h2>
        <div className="table-container">
          <table className="tabla-movimientos tabla-entradas">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Registrado por</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((m, index) => (
                <tr
                  key={m.id}
                  className={index % 2 === 0 ? "row-even" : "row-odd"}
                >
                  <td>
                    <div className="date-container">
                      <div className="date">
                        {new Date(m.date).toLocaleDateString("es-EC")}
                      </div>
                      <div className="time">
                        {new Date(m.date).toLocaleTimeString("es-EC", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </td>
                  <td>{m.product_name}</td>
                  <td className="quantity-positive">+{m.quantity}</td>
                  <td>{m.supplier_name}</td>
                  <td>{m.product_stock}</td>
                  <td>{m.user_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salidas */}
      <div>
        <h2 className="table-title">Salidas</h2>
        <div className="table-container">
          <table className="tabla-movimientos tabla-salidas">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Cliente</th>
                <th>Stock</th>
                <th>Registrado por</th>
              </tr>
            </thead>
            <tbody>
              {salidas.map((m, index) => (
                <tr
                  key={m.id}
                  className={index % 2 === 0 ? "row-even" : "row-odd"}
                >
                  <td>
                    <div className="date-container">
                      <div className="date">
                        {new Date(m.date).toLocaleDateString("es-EC")}
                      </div>
                      <div className="time">
                        {new Date(m.date).toLocaleTimeString("es-EC", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </td>
                  <td>{m.product_name}</td>
                  <td className="quantity-negative">-{m.quantity}</td>
                  <td>{m.customer_name}</td>
                  <td>{m.product_stock}</td>
                  <td>{m.user_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={`${tipo === "input" ? "📈 Añadir Entrada" : "📉 Añadir Salida"}`}
          onClose={() => setShowModal(false)}
        >
          <div className="formContainer">
            <div className="formGroup">
              <label className="form-label">
                <CalendarClock size={16} style={{ marginRight: "6px" }} />
                Fecha:
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={(e) => {
                  handleInputChange(e);
                  e.target.blur();
                }}
                className="input"
              />
            </div>

            <div className="formGroup">
              <label className="form-label">
                <ArrowUpToLine size={16} style={{ marginRight: "6px" }} />
                Cantidad:
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="input"
                min={1}
              />
            </div>

            <div className="formGroup">
              <label className="form-label">
                <Boxes size={16} style={{ marginRight: "6px" }} />
                Producto:
              </label>
              <select
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                className="select"
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {tipo === "output" && (
              <div className="formGroup">
                <label className="form-label">
                  <User size={16} style={{ marginRight: "6px" }} />
                  Cliente:
                </label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="select"
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="button" onClick={handleSubmit} className="formButton">
              Guardar Movimiento
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TransactionsPage;
