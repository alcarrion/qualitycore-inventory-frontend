// TransactionsPage/TransactionFormModal.js
import React from "react";
import Modal from "../../components/Modal";
import {
  CalendarClock,
  User,
  Boxes,
  ArrowUpToLine,
  ShoppingCart,
} from "lucide-react";

/**
 * Modal para añadir entradas (compras) y salidas (ventas)
 * Mantiene toda la lógica en el componente padre TransactionsPage
 */
function TransactionFormModal({
  // Control de modal
  show,
  onClose,
  type, // "input" | "output"

  // Fecha y hora
  currentTime,

  // Proveedor (para entradas)
  supplierSearch,
  onSupplierSearchChange,
  showSupplierDropdown,
  onShowSupplierDropdownChange,
  selectedSupplier,
  onSelectSupplier,
  onSupplierSelect,
  filteredSuppliers,

  // Cliente (para salidas)
  customerSearch,
  onCustomerSearchChange,
  showCustomerDropdown,
  onShowCustomerDropdownChange,
  selectedCustomer,
  onSelectCustomer,
  onCustomerSelect,
  filteredCustomers,

  // Productos
  productSearch,
  onProductSearchChange,
  showProductDropdown,
  onShowProductDropdownChange,
  onProductSelect,
  filteredProducts,

  // Form data
  formData,
  onFormDataChange,
  onWheel,

  // Carrito
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  totalPrice,

  // Submit
  onSubmit,
}) {
  if (!show) return null;

  return (
    <Modal
      title={`${type === "input" ? "📈 Añadir Entrada" : "📉 Añadir Salida"}`}
      onClose={onClose}
    >
      <div className="formContainer">
        <div className="formGroup">
          <label className="form-label">
            <CalendarClock size={16} style={{ marginRight: "6px" }} />
            Fecha y Hora del Movimiento:
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
          <small style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            ⏱ La hora se capturará automáticamente al guardar el movimiento
          </small>
        </div>

        {/* Proveedor (solo para entradas) */}
        {type === "input" && (
          <div className="formGroup" style={{ position: 'relative' }}>
            <label className="form-label">
              <User size={16} style={{ marginRight: "6px" }} />
              Proveedor:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => {
                  onSupplierSearchChange(e.target.value);
                  onShowSupplierDropdownChange(true);
                  onShowProductDropdownChange(false);
                  onSelectSupplier("");
                }}
                onFocus={() => {
                  onShowSupplierDropdownChange(true);
                  onShowProductDropdownChange(false);
                }}
                placeholder="Buscar proveedor..."
                className="input"
                autoComplete="off"
                style={{ paddingRight: supplierSearch ? '35px' : '12px' }}
              />
              {supplierSearch && (
                <button
                  onClick={() => {
                    onSupplierSearchChange("");
                    onSelectSupplier("");
                    onShowSupplierDropdownChange(false);
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
                  ✕
                </button>
              )}
            </div>
            {showSupplierDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000
              }}>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.slice(0, 10).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onSupplierSelect(s)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: '500' }}>{s.name}</div>
                      {s.email && (
                        <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                          {s.email}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No se encontraron proveedores
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cliente (solo para salidas) */}
        {type === "output" && (
          <div className="formGroup" style={{ position: 'relative' }}>
            <label className="form-label">
              <User size={16} style={{ marginRight: "6px" }} />
              Cliente:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  onCustomerSearchChange(e.target.value);
                  onShowCustomerDropdownChange(true);
                  onShowProductDropdownChange(false);
                  onSelectCustomer("");
                }}
                onFocus={() => {
                  onShowCustomerDropdownChange(true);
                  onShowProductDropdownChange(false);
                }}
                placeholder="Buscar cliente..."
                className="input"
                autoComplete="off"
                style={{ paddingRight: customerSearch ? '35px' : '12px' }}
              />
              {customerSearch && (
                <button
                  onClick={() => {
                    onCustomerSearchChange("");
                    onSelectCustomer("");
                    onShowCustomerDropdownChange(false);
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
                  ✕
                </button>
              )}
            </div>
            {showCustomerDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000
              }}>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.slice(0, 10).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onCustomerSelect(c)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: '500' }}>{c.name}</div>
                      {c.email && (
                        <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                          {c.email}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No se encontraron clientes
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selector de producto y cantidad */}
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
                onShowSupplierDropdownChange(false);
                onShowCustomerDropdownChange(false);
              }}
              onFocus={() => {
                onShowProductDropdownChange(true);
                onShowSupplierDropdownChange(false);
                onShowCustomerDropdownChange(false);
              }}
              placeholder="Buscar producto por nombre o código..."
              className="input"
              autoComplete="off"
              disabled={(type === "input" && !selectedSupplier) || (type === "output" && !selectedCustomer)}
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
                ✕
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
                          Código: {p.code}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                        <div style={{ fontSize: '0.85em', fontWeight: '500', color: 'var(--primary-color)' }}>
                          ${parseFloat(p.price).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{
                          fontSize: '0.75em',
                          color: (p.availableStock ?? p.current_stock) > p.min_stock ? 'var(--text-success)' : 'var(--text-danger)',
                          fontWeight: '500'
                        }}>
                          Stock: {p.availableStock ?? p.current_stock}
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

        {/* Cantidad */}
        {formData.product && (
          <div className="formGroup">
            <label className="form-label">
              <ArrowUpToLine size={16} style={{ marginRight: "6px" }} />
              Cantidad:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={onFormDataChange}
                onWheel={onWheel}
                className="input"
                min={1}
                style={{ flex: 1 }}
                disabled={(type === "input" && !selectedSupplier) || (type === "output" && !selectedCustomer)}
              />
              <button
                type="button"
                onClick={onAddToCart}
                className="btn-primary"
                style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                disabled={(type === "input" && !selectedSupplier) || (type === "output" && !selectedCustomer)}
              >
                + Agregar
              </button>
            </div>
          </div>
        )}

        {/* Carrito (para ambos tipos) */}
        {cart.length > 0 && (
          <div className="formGroup" style={{ marginTop: '16px' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <ShoppingCart size={16} /> Productos en el carrito:
            </label>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      ${parseFloat(item.product.price).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {item.quantity} = ${(item.product.price * item.quantity).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateCartQuantity(item.product.id, Number(e.target.value))}
                      onWheel={onWheel}
                      min={1}
                      max={item.product.current_stock}
                      style={{
                        width: '60px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '2px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: '600',
                fontSize: '16px',
                color: 'var(--text-primary)'
              }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary-color)' }}>
                  ${totalPrice.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        <button type="button" onClick={onSubmit} className="formButton">
          {type === "input"
            ? `Guardar Compra (${cart.length} producto${cart.length !== 1 ? 's' : ''})`
            : `Guardar Venta (${cart.length} producto${cart.length !== 1 ? 's' : ''})`
          }
        </button>
      </div>
    </Modal>
  );
}

export default TransactionFormModal;
