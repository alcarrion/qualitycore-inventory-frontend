// TransactionsPage/InvoiceModal.js
import React from "react";
import Modal from "../../components/Modal";
import { Calendar, User, Package } from "lucide-react";

/**
 * Modal genérico para mostrar detalles de facturas (compras y ventas)
 *
 * @param {Object} props
 * @param {boolean} props.show - Si el modal debe mostrarse
 * @param {string} props.type - Tipo de factura: "purchase" o "sale"
 * @param {Object} props.invoice - Datos de la factura
 * @param {Function} props.onClose - Función para cerrar el modal
 */
function InvoiceModal({ show, type, invoice, onClose }) {
  if (!show || !invoice) return null;

  const isPurchase = type === "purchase";
  const title = isPurchase ? "FACTURA DE COMPRA" : "FACTURA DE VENTA";
  const themeColor = isPurchase ? "var(--color-success)" : "var(--color-brand-primary)";
  const entityLabel = isPurchase ? "PROVEEDOR" : "CLIENTE";
  const entityName = isPurchase ? invoice.supplier_name : invoice.customer_name;

  return (
    <Modal onClose={onClose} className="wide-modal">
      <div style={{
        margin: '0 auto',
        fontFamily: 'var(--font-family-base)'
      }}>
        {/* Encabezado de factura */}
        <div style={{
          textAlign: 'center',
          borderBottom: `3px solid ${themeColor}`,
          paddingBottom: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: themeColor,
            margin: '0 0 var(--space-sm) 0'
          }}>
            {title}
          </h2>
          <div style={{
            fontSize: 'var(--font-size-xl)',
            color: 'var(--text-secondary)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            N° {invoice.id}
          </div>
        </div>

        {/* Información de fecha y cliente/proveedor */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)',
          padding: 'var(--space-lg)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-primary)'
        }}>
          <div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)'
            }}>
              <Calendar size={16} /> FECHA Y HORA
            </div>
            <div style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              {new Date(invoice.date).toLocaleDateString('es-EC', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
            <div style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-secondary)'
            }}>
              {new Date(invoice.date).toLocaleTimeString('es-EC', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)'
            }}>
              <User size={16} /> {entityLabel}
            </div>
            <div style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              {entityName}
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-md)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            <Package size={20} /> Productos
          </div>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th style={{
                  padding: 'var(--space-md)',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-secondary)',
                  borderBottom: '2px solid var(--border-primary)'
                }}>
                  Producto
                </th>
                <th style={{
                  padding: 'var(--space-md)',
                  textAlign: 'center',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-secondary)',
                  borderBottom: '2px solid var(--border-primary)'
                }}>
                  Cantidad
                </th>
                <th style={{
                  padding: 'var(--space-md)',
                  textAlign: 'right',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-secondary)',
                  borderBottom: '2px solid var(--border-primary)'
                }}>
                  Precio Unit.
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.movements && invoice.movements.length > 0 ? (
                invoice.movements.map((m, i) => {
                  return (
                    <tr key={i} style={{
                      borderBottom: i < invoice.movements.length - 1 ? '1px solid var(--border-primary)' : 'none'
                    }}>
                      <td style={{
                        padding: 'var(--space-md)',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--text-primary)'
                      }}>
                        {m.product_name}
                      </td>
                      <td style={{
                        padding: 'var(--space-md)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--text-primary)',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        ×{m.quantity}
                      </td>
                      <td style={{
                        padding: 'var(--space-md)',
                        textAlign: 'right',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--text-primary)',
                        fontWeight: 'var(--font-weight-semibold)'
                      }}>
                        ${parseFloat(m.price).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{
                    padding: 'var(--space-lg)',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    No hay productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 'var(--space-xl)'
        }}>
          <div style={{
            background: themeColor,
            color: 'white',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            minWidth: '200px'
          }}>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              marginBottom: 'var(--space-xs)',
              opacity: 0.9
            }}>
              TOTAL
            </div>
            <div style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)'
            }}>
              ${parseFloat(invoice.total).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div style={{
          padding: 'var(--space-lg)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          marginBottom: 'var(--space-lg)'
        }}>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)'
          }}>
            <strong>Registrado por:</strong> {invoice.user_name}
          </div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-xs)'
          }}>
            <strong>Fecha de registro:</strong> {new Date(invoice.created_at || invoice.date).toLocaleString('es-EC')}
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all var(--transition-base)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'var(--color-hover)';
            e.target.style.borderColor = themeColor;
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'var(--bg-secondary)';
            e.target.style.borderColor = 'var(--border-primary)';
          }}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}

export default InvoiceModal;
