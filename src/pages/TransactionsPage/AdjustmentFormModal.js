// TransactionsPage/AdjustmentFormModal.js
import React from "react";
import Modal from "../../components/Modal";
import { CalendarClock, Boxes, FileText, ArrowUpToLine } from "lucide-react";

/**
 * Modal para ajustes de inventario.
 * Solo visible para Admin y SuperAdmin.
 * Permite corregir stock sin eliminar el historial.
 */
function AdjustmentFormModal({
  show,
  onClose,
  currentTime,

  // Producto
  productSearch,
  onProductSearchChange,
  showProductDropdown,
  onShowProductDropdownChange,
  onProductSelect,
  filteredProducts,
  selectedProduct,

  // Form
  quantity,
  onQuantityChange,
  reason,
  onReasonChange,
  onWheel,

  // Submit
  onSubmit,
  isSubmitting,
}) {
  if (!show) return null;

  const qty = Number(quantity) || 0;
  const adjustedStock = selectedProduct ? selectedProduct.current_stock + qty : null;
  const isNegative = qty < 0;
  const isPositive = qty > 0;

  return (
    <Modal title="Ajuste de Inventario" onClose={onClose}>
      <div className="formContainer">
        {/* Fecha y hora */}
        <div className="formGroup">
          <label className="form-label">
            <CalendarClock size={16} style={{ marginRight: "6px" }} />
            Fecha y Hora del Ajuste:
          </label>
          <div style={{
            padding: '10px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              {currentTime.toLocaleDateString('es-EC', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--primary-color)',
              fontFamily: 'monospace'
            }}>
              {currentTime.toLocaleTimeString('es-EC', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Producto */}
        <div className="formGroup" style={{ position: 'relative' }}>
          <label className="form-label">
            <Boxes size={16} style={{ marginRight: "6px" }} />
            Producto:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                onProductSearchChange(e.target.value);
                onShowProductDropdownChange(true);
              }}
              onFocus={() => onShowProductDropdownChange(true)}
              placeholder="Buscar producto por nombre o codigo..."
              className="input"
              autoComplete="off"
              style={{ paddingRight: productSearch ? '35px' : '12px' }}
            />
            {productSearch && (
              <button
                onClick={() => {
                  onProductSearchChange("");
                  onShowProductDropdownChange(false);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '18px',
                  padding: '2px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                type="button"
              >
                X
              </button>
            )}
          </div>
          {showProductDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '250px',
              overflowY: 'auto',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              marginTop: '4px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000
            }}>
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 15).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onProductSelect(p)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{p.name}</div>
                        <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                          Codigo: {p.code}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                        <div style={{
                          fontSize: '0.85em',
                          fontWeight: '500',
                          color: p.current_stock > (p.minimum_stock || p.min_stock) ? 'var(--text-success)' : 'var(--text-danger)',
                        }}>
                          Stock: {p.current_stock}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron productos
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cantidad del ajuste */}
        {selectedProduct && (
          <div className="formGroup">
            <label className="form-label">
              <ArrowUpToLine size={16} style={{ marginRight: "6px" }} />
              Cantidad del Ajuste:
              <small style={{ marginLeft: 8, color: 'var(--text-secondary)', fontWeight: 400 }}>
                (positivo = agregar, negativo = reducir)
              </small>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={onQuantityChange}
              onWheel={onWheel}
              className="input"
              placeholder="Ej: 10 o -5"
            />
            {/* Preview de stock resultante */}
            {qty !== 0 && (
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: '6px',
                background: isNegative
                  ? 'rgba(239, 68, 68, 0.1)'
                  : isPositive
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'transparent',
                border: `1px solid ${isNegative ? 'rgba(239, 68, 68, 0.3)' : isPositive ? 'rgba(34, 197, 94, 0.3)' : 'transparent'}`,
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  Stock actual: <strong>{selectedProduct.current_stock}</strong>
                </span>
                <span style={{
                  color: isNegative ? '#ef4444' : '#22c55e',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  Stock resultante: {adjustedStock}
                </span>
              </div>
            )}
            {/* Warning si stock resultante es negativo */}
            {qty !== 0 && adjustedStock < 0 && (
              <div style={{
                marginTop: 4,
                fontSize: '12px',
                color: '#ef4444',
                fontWeight: 500,
              }}>
                El ajuste excede el stock disponible
              </div>
            )}
          </div>
        )}

        {/* Motivo del ajuste */}
        <div className="formGroup">
          <label className="form-label">
            <FileText size={16} style={{ marginRight: "6px" }} />
            Motivo del Ajuste: <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={onReasonChange}
            className="input"
            rows={3}
            maxLength={500}
            placeholder="Ej: Correccion por conteo fisico, merma, producto danado..."
            style={{ resize: 'vertical', minHeight: '70px' }}
          />
          <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            {reason.length}/500 caracteres
          </small>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="formButton"
          disabled={
            isSubmitting ||
            !selectedProduct ||
            !quantity ||
            qty === 0 ||
            !reason.trim() ||
            adjustedStock < 0
          }
          style={{
            opacity: (isSubmitting || !selectedProduct || !quantity || qty === 0 || !reason.trim() || adjustedStock < 0) ? 0.6 : 1,
          }}
        >
          {isSubmitting ? "Guardando..." : "Guardar Ajuste"}
        </button>
      </div>
    </Modal>
  );
}

export default AdjustmentFormModal;
