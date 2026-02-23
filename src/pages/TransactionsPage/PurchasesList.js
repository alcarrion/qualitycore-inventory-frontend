// TransactionsPage/PurchasesList.js
import React, { useMemo } from "react";
import { ShoppingCart, FileText } from "lucide-react";

/**
 * Componente que muestra la lista de compras (entradas) agrupadas.
 * Filtrado client-side por searchTerm.
 */
function PurchasesList({ purchases, onViewDetails, searchTerm = "" }) {
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return purchases;
    return purchases.filter((p) => {
      const date = new Date(p.date);
      const dateStr = date.toLocaleDateString("es-EC");
      const timeStr = date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
      const total = parseFloat(p.total).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const searchable = [dateStr, timeStr, `compra #${p.id}`, p.supplier_name || "", total, p.user_name || ""].join(" ").toLowerCase();
      return searchable.includes(term);
    });
  }, [purchases, searchTerm]);

  return (
    <div>
      <h2 className="table-title">Entradas (Compras)</h2>
      <div className="table-container">
        <table className="tabla-movimientos tabla-entradas">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Proveedor</th>
              <th>Total</th>
              <th>Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No se encontraron compras.
                </td>
              </tr>
            ) : (
              filtered.map((purchase, index) => (
                <tr
                  key={purchase.id}
                  className={index % 2 === 0 ? "row-even" : "row-odd"}
                  style={{ cursor: 'pointer' }}
                  title="Click para ver detalles"
                >
                  <td>
                    <div className="date-container">
                      <div className="date">
                        {new Date(purchase.date).toLocaleDateString("es-EC")}
                      </div>
                      <div className="time">
                        {new Date(purchase.date).toLocaleTimeString("es-EC", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <ShoppingCart size={16} /> Compra #{purchase.id}
                      </strong>
                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={() => onViewDetails(purchase)}
                          style={{
                            background: 'var(--color-brand-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85em',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onMouseOver={(e) => e.target.style.background = 'var(--color-brand-primary-hover)'}
                          onMouseOut={(e) => e.target.style.background = 'var(--color-brand-primary)'}
                        >
                          <FileText size={14} /> Ver detalles
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>{purchase.supplier_name}</td>
                  <td className="quantity-positive" style={{ fontWeight: 'bold' }}>
                    ${parseFloat(purchase.total).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>{purchase.user_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PurchasesList;
