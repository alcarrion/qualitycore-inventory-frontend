// TransactionsPage/SalesList.tsx
import React, { useMemo } from "react";
import { ShoppingCart, FileText } from "lucide-react";
import type { Sale } from "../../types/models";

interface Props {
  sales: Sale[];
  onViewDetails: (sale: Sale) => void;
  searchTerm?: string;
}

function SalesList({ sales, onViewDetails, searchTerm = "" }: Props) {
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sales;
    return sales.filter((s) => {
      const date = new Date(s.date);
      const dateStr = date.toLocaleDateString("es-EC");
      const timeStr = date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
      const total = parseFloat(String(s.total)).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const searchable = [dateStr, timeStr, `venta #${s.id}`, s.customer_name || "", total, s.user_name || ""].join(" ").toLowerCase();
      return searchable.includes(term);
    });
  }, [sales, searchTerm]);

  return (
    <div>
      <h2 className="table-title">Salidas (Ventas)</h2>
      <div className="table-container">
        <table className="tabla-movimientos tabla-salidas">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">
                  No se encontraron ventas.
                </td>
              </tr>
            ) : (
              filtered.map((sale, index) => (
                <tr
                  key={sale.id}
                  className={index % 2 === 0 ? "row-even" : "row-odd"}
                  style={{ cursor: 'pointer' }}
                  title="Click para ver detalles"
                >
                  <td>
                    <div className="date-container">
                      <div className="date">
                        {new Date(sale.date).toLocaleDateString("es-EC")}
                      </div>
                      <div className="time">
                        {new Date(sale.date).toLocaleTimeString("es-EC", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <ShoppingCart size={16} /> Venta #{sale.id}
                      </strong>
                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={() => onViewDetails(sale)}
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
                          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-brand-primary-hover)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'var(--color-brand-primary)'; }}
                        >
                          <FileText size={14} /> Ver detalles
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>{sale.customer_name}</td>
                  <td className="quantity-negative" style={{ fontWeight: 'bold' }}>
                    ${parseFloat(String(sale.total)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>{sale.user_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesList;
