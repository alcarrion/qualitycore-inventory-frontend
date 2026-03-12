// TransactionsPage/AdjustmentFormModal.tsx
import React from "react";
import Modal from "../../components/Modal";
import SearchableDropdown from "../../components/SearchableDropdown";
import type { DropdownController } from "../../components/SearchableDropdown";
import { CalendarClock, Boxes, FileText, ArrowUpToLine } from "lucide-react";
import type { Product } from "../../types/models";

interface Props {
  show: boolean;
  onClose: () => void;
  currentTime: Date;
  productDropdown: DropdownController<Product>;
  onProductSelect: (product: Product, displayText: string) => void;
  selectedProduct: Product | null;
  quantity: string | number;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reason: string;
  onReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function AdjustmentFormModal({
  show,
  onClose,
  currentTime,
  productDropdown,
  onProductSelect,
  selectedProduct,
  quantity,
  onQuantityChange,
  reason,
  onReasonChange,
  onWheel,
  onSubmit,
  isSubmitting,
}: Props) {
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
        <div className="formGroup">
          <label className="form-label">
            <Boxes size={16} style={{ marginRight: "6px" }} />
            Producto:
          </label>
          <SearchableDropdown
            dropdown={productDropdown}
            onSelect={(p) => onProductSelect(p, `${p.name} (Stock: ${p.current_stock})`)}
            placeholder="Buscar producto por nombre o codigo..."
            emptyMessage="No se encontraron productos"
            maxItems={15}
            renderItem={(p) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{p.name}</div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                  <div style={{
                    fontSize: '0.85em',
                    fontWeight: '500',
                    color: p.current_stock > (p.minimum_stock ?? 0) ? 'var(--text-success)' : 'var(--text-danger)',
                  }}>
                    Stock: {p.current_stock}
                  </div>
                </div>
              </div>
            )}
          />
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
            {qty !== 0 && adjustedStock !== null && adjustedStock < 0 && (
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
            (adjustedStock !== null && adjustedStock < 0)
          }
          style={{
            opacity: (isSubmitting || !selectedProduct || !quantity || qty === 0 || !reason.trim() || (adjustedStock !== null && adjustedStock < 0)) ? 0.6 : 1,
          }}
        >
          {isSubmitting ? "Guardando..." : "Guardar Ajuste"}
        </button>
      </div>
    </Modal>
  );
}

export default AdjustmentFormModal;
