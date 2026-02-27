// TransactionsPage/InvoiceModal.tsx
import React, { useState } from "react";
import Modal from "../../components/Modal";
import { Calendar, User, Package, Pencil } from "lucide-react";
import type { Sale, Purchase, InvoiceMovement } from "../../types/models";
import "../../styles/components/InvoiceModal.css";

type InvoiceType = 'sale' | 'purchase';

interface Props {
  show: boolean;
  type: InvoiceType;
  invoice: Sale | Purchase | null;
  onClose: () => void;
  isAdmin: boolean;
  onCorrect?: (movementId: number, data: { new_quantity: number; reason: string }, type: InvoiceType, invoiceId: number) => Promise<boolean>;
}

function InvoiceModal({ show, type, invoice, onClose, isAdmin, onCorrect }: Props) {
  const [correctingId, setCorrectingId] = useState<number | null>(null);
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
  const entityName = isPurchase
    ? (invoice as Purchase).supplier_name
    : (invoice as Sale).customer_name;

  const handleStartCorrection = (movement: InvoiceMovement) => {
    setCorrectingId(movement.id);
    setNewQuantity(String(movement.quantity));
    setReason("");
  };

  const handleCancelCorrection = () => {
    setCorrectingId(null);
    setNewQuantity("");
    setReason("");
  };

  const handleSubmitCorrection = async (movementId: number) => {
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

  const canSubmitCorrection = (movement: InvoiceMovement) => {
    const qty = Number(newQuantity);
    return (
      !submitting &&
      qty > 0 &&
      qty !== movement.quantity &&
      reason.trim().length > 0
    );
  };

  const movements = invoice.movements ?? [];

  return (
    <Modal onClose={handleClose} className="wide-modal">
      <div className="invoice-container">
        <div className="invoice-header" style={{ borderBottomColor: themeColor }}>
          <h2 className="invoice-title" style={{ color: themeColor }}>
            {title}
          </h2>
          <div className="invoice-number">N° {invoice.id}</div>
        </div>

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
              {movements.length > 0 ? (
                movements.map((m) => {
                  const isCorrected = m.corrected_by_id != null;
                  const isCorrecting = correctingId === m.id;
                  const correctedQty = isCorrected
                    ? (isPurchase
                        ? m.quantity + (m.correction_quantity ?? 0)
                        : m.quantity - (m.correction_quantity ?? 0))
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
                              <span className="correction-new">×{correctedQty}</span>
                            </span>
                          ) : (
                            `×${m.quantity}`
                          )}
                        </td>
                        <td className="text-right">
                          ${parseFloat(String(m.price)).toLocaleString('es-EC', {
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

        <div className="invoice-total">
          <div className="invoice-total-row">
            <span className="invoice-total-label">TOTAL</span>
            <span className="invoice-total-value" style={{ color: themeColor }}>
              ${parseFloat(String(invoice.total)).toLocaleString('es-EC', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

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
