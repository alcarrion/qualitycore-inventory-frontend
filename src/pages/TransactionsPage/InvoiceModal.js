// TransactionsPage/InvoiceModal.js
import React, { useState } from "react";
import Modal from "../../components/Modal";
import { Calendar, User, Package, Pencil } from "lucide-react";
import "../../styles/components/InvoiceModal.css";

/**
 * Modal genérico para mostrar detalles de facturas (compras y ventas)
 * con funcionalidad de corrección de movimientos para admins.
 */
function InvoiceModal({ show, type, invoice, onClose, isAdmin, onCorrect }) {
  const [correctingId, setCorrectingId] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setCorrectingId(null);
    setNewQuantity("");
    setReason("");
    onClose();
  };

  if (!show || !invoice) return null;

  const isPurchase = type === "purchase";
  const title = isPurchase ? "FACTURA DE COMPRA" : "FACTURA DE VENTA";
  const themeColor = isPurchase ? "var(--color-success)" : "var(--color-brand-primary)";
  const entityLabel = isPurchase ? "PROVEEDOR" : "CLIENTE";
  const entityName = isPurchase ? invoice.supplier_name : invoice.customer_name;

  const handleStartCorrection = (movement) => {
    setCorrectingId(movement.id);
    setNewQuantity(String(movement.quantity));
    setReason("");
  };

  const handleCancelCorrection = () => {
    setCorrectingId(null);
    setNewQuantity("");
    setReason("");
  };

  const handleSubmitCorrection = async (movementId) => {
    if (!onCorrect) return;
    setSubmitting(true);
    const success = await onCorrect(movementId, {
      new_quantity: Number(newQuantity),
      reason: reason.trim(),
    }, type, invoice.id);
    setSubmitting(false);
    if (success) {
      handleCancelCorrection();
    }
  };

  const canSubmitCorrection = (movement) => {
    const qty = Number(newQuantity);
    return (
      !submitting &&
      qty > 0 &&
      qty !== movement.quantity &&
      reason.trim().length > 0
    );
  };

  return (
    <Modal onClose={handleClose} className="wide-modal">
      <div className="invoice-container">
        {/* Encabezado de factura */}
        <div className="invoice-header" style={{ borderBottomColor: themeColor }}>
          <h2 className="invoice-title" style={{ color: themeColor }}>
            {title}
          </h2>
          <div className="invoice-number">N° {invoice.id}</div>
        </div>

        {/* Información de fecha y cliente/proveedor */}
        <div className="invoice-info-grid">
          <div className="invoice-info-item">
            <div className="invoice-info-label">
              <Calendar size={16} /> FECHA Y HORA
            </div>
            <div className="invoice-info-value">
              {new Date(invoice.date).toLocaleDateString('es-EC', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </div>
            <div className="invoice-info-time">
              {new Date(invoice.date).toLocaleTimeString('es-EC', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </div>
          </div>

          <div className="invoice-info-item">
            <div className="invoice-info-label">
              <User size={16} /> {entityLabel}
            </div>
            <div className="invoice-info-value">{entityName}</div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="invoice-section">
          <div className="invoice-section-title">
            <Package size={20} /> Productos
          </div>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-center">Cantidad</th>
                <th className="text-right">Precio Unit.</th>
                {isAdmin && onCorrect && <th className="text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {invoice.movements && invoice.movements.length > 0 ? (
                invoice.movements.map((m) => {
                  const isCorrected = m.corrected_by_id != null;
                  const isCorrecting = correctingId === m.id;
                  // Input: correction_quantity = new - original (negativo si se redujo)
                  // Output: correction_quantity = original - new (positivo si se redujo)
                  const correctedQty = isCorrected
                    ? (isPurchase
                        ? m.quantity + m.correction_quantity
                        : m.quantity - m.correction_quantity)
                    : null;

                  return (
                    <React.Fragment key={m.id}>
                      <tr>
                        <td>{m.product_name}</td>
                        <td className="text-center">
                          {isCorrected ? (
                            <span className="correction-display">
                              <span className="correction-original">×{m.quantity}</span>
                              <span className="correction-arrow">→</span>
                              <span className="correction-new">
                                ×{correctedQty}
                              </span>
                            </span>
                          ) : (
                            `×${m.quantity}`
                          )}
                        </td>
                        <td className="text-right">
                          ${parseFloat(m.price).toLocaleString('es-EC', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        {isAdmin && onCorrect && (
                          <td className="text-center">
                            {isCorrected ? (
                              <span className="correction-badge">Corregido</span>
                            ) : (
                              <button
                                type="button"
                                className="correction-btn"
                                onClick={() => handleStartCorrection(m)}
                                disabled={isCorrecting}
                                title="Corregir cantidad"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>

                      {/* Fila expandida para corrección */}
                      {isCorrecting && (
                        <tr className="correction-row">
                          <td colSpan={isAdmin && onCorrect ? 4 : 3}>
                            <div className="correction-form">
                              <div className="correction-form-fields">
                                <div className="correction-field">
                                  <label>Cantidad correcta:</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                    className="correction-input"
                                    autoFocus
                                  />
                                </div>
                                <div className="correction-field correction-field-reason">
                                  <label>Motivo:</label>
                                  <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Ej: Error en conteo, cantidad incorrecta..."
                                    className="correction-input"
                                    maxLength={500}
                                  />
                                </div>
                              </div>
                              <div className="correction-form-actions">
                                <button
                                  type="button"
                                  className="correction-submit"
                                  disabled={!canSubmitCorrection(m)}
                                  onClick={() => handleSubmitCorrection(m.id)}
                                >
                                  {submitting ? "Guardando..." : "Aplicar"}
                                </button>
                                <button
                                  type="button"
                                  className="correction-cancel"
                                  onClick={handleCancelCorrection}
                                  disabled={submitting}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin && onCorrect ? 4 : 3} className="empty-message">
                    No hay productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="invoice-total">
          <div className="invoice-total-row">
            <span className="invoice-total-label">TOTAL</span>
            <span className="invoice-total-value" style={{ color: themeColor }}>
              ${parseFloat(invoice.total).toLocaleString('es-EC', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="invoice-footer">
          <div className="invoice-footer-item">
            <strong>Registrado por:</strong> {invoice.user_name}
          </div>
          <div className="invoice-footer-item">
            <strong>Fecha de registro:</strong>{" "}
            {new Date(invoice.created_at || invoice.date).toLocaleString('es-EC')}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default InvoiceModal;
