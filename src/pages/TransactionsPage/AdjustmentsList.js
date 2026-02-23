// TransactionsPage/AdjustmentsList.js
import React, { useMemo } from "react";
import { SlidersHorizontal, Pencil, FileText } from "lucide-react";

/**
 * Componente que muestra el historial de ajustes y correcciones de inventario.
 * Correcciones se agrupan por factura en una sola fila.
 * Ajustes se muestran como filas individuales.
 */
function AdjustmentsList({ movements, searchTerm = "" }) {
  const adjustments = useMemo(() => {
    const base = movements.filter(
      (m) => m.movement_type === "adjustment" || m.movement_type === "correction"
    );

    const term = searchTerm.trim().toLowerCase();
    if (!term) return base;

    return base.filter((m) => {
      const date = new Date(m.date);
      const dateStr = date.toLocaleDateString("es-EC");
      const timeStr = date.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
      const type = m.movement_type === "adjustment" ? "ajuste" : "corrección correccion";
      const invoice = m.sale ? `venta #${m.sale}` : m.purchase ? `compra #${m.purchase}` : "";
      const searchable = [
        dateStr,
        timeStr,
        type,
        invoice,
        m.product_name || "",
        m.user_name || "",
        m.reason || "",
        String(m.quantity || ""),
      ].join(" ").toLowerCase();

      return searchable.includes(term);
    });
  }, [movements, searchTerm]);

  // Agrupar: correcciones por factura, ajustes individuales
  const groups = useMemo(() => {
    const result = [];
    const invoiceMap = {};

    for (const m of adjustments) {
      if (m.movement_type === "correction") {
        const key = m.sale ? `sale-${m.sale}` : m.purchase ? `purchase-${m.purchase}` : null;
        if (key) {
          if (!invoiceMap[key]) {
            invoiceMap[key] = {
              type: "correction-group",
              invoiceType: m.sale ? "sale" : "purchase",
              invoiceId: m.sale || m.purchase,
              items: [],
              date: m.date,
              userName: m.user_name,
            };
            result.push(invoiceMap[key]);
          }
          invoiceMap[key].items.push(m);
          if (new Date(m.date) > new Date(invoiceMap[key].date)) {
            invoiceMap[key].date = m.date;
          }
        } else {
          result.push({ type: "single", movement: m });
        }
      } else {
        result.push({ type: "single", movement: m });
      }
    }

    result.sort((a, b) => {
      const dateA = a.type === "single" ? a.movement.date : a.date;
      const dateB = b.type === "single" ? b.movement.date : b.date;
      return new Date(dateB) - new Date(dateA);
    });

    return result;
  }, [adjustments]);

  return (
    <div>
      <h2 className="table-title">Ajustes y Correcciones</h2>
      <div className="table-container">
        <table className="tabla-movimientos tabla-ajustes">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th className="text-center">Factura</th>
              <th className="text-center">Detalle</th>
              <th>Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  {searchTerm.trim() ? "No se encontraron ajustes ni correcciones." : "No hay ajustes ni correcciones registrados."}
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                if (group.type === "single") {
                  return renderAdjustmentRow(group.movement);
                }
                return renderCorrectionGroupRow(group);
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Fila individual para ajustes de inventario */
function renderAdjustmentRow(m) {
  const isPositive = m.quantity > 0;

  return (
    <tr key={m.id}>
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
      <td>
        <span className="adjustment-type-badge type-adjustment">
          <SlidersHorizontal size={12} /> Ajuste
        </span>
      </td>
      <td></td>
      <td>
        <div className="correction-detail-item">
          <div className="correction-detail-main">
            <span className="correction-detail-product">{m.product_name}</span>
            <span className={`correction-detail-qty ${isPositive ? "positive" : "negative"}`}>
              {isPositive ? `+${m.quantity}` : m.quantity} uds.
            </span>
          </div>
          {m.reason && (
            <span className="correction-detail-reason">{m.reason}</span>
          )}
        </div>
      </td>
      <td>{m.user_name}</td>
    </tr>
  );
}

/** Fila agrupada para correcciones de una factura */
function renderCorrectionGroupRow(group) {
  const label = group.invoiceType === "sale"
    ? `Venta #${group.invoiceId}`
    : `Compra #${group.invoiceId}`;

  return (
    <tr key={`group-${group.invoiceType}-${group.invoiceId}`}>
      <td>
        <div className="date-container">
          <div className="date">
            {new Date(group.date).toLocaleDateString("es-EC")}
          </div>
          <div className="time">
            {new Date(group.date).toLocaleTimeString("es-EC", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </td>
      <td>
        <span className="adjustment-type-badge type-correction">
          <Pencil size={12} /> Corrección
        </span>
      </td>
      <td>
        <div className="correction-invoice-ref">
          <FileText size={12} /> {label}
        </div>
      </td>
      <td>
        <div className="correction-details-list">
          {group.items.map((m) => {
            const originalQty = m.original_quantity;
            // Calcular cantidad corregida:
            // Compra (input): diff = new - original → new = original + diff
            // Venta (output): diff = original - new → new = original - diff
            const correctedQty = originalQty != null
              ? (m.purchase
                  ? originalQty + m.quantity
                  : originalQty - m.quantity)
              : null;

            return (
              <div key={m.id} className="correction-detail-item">
                <div className="correction-detail-main">
                  <span className="correction-detail-product">{m.product_name}:</span>
                  {originalQty != null ? (
                    <span className="correction-detail-change">
                      <span className="correction-qty-original">{originalQty}</span>
                      <span className="correction-qty-arrow">→</span>
                      <span className={correctedQty < originalQty ? "correction-qty-decreased" : "correction-qty-new"}>{correctedQty}</span>
                    </span>
                  ) : (
                    <span className={`correction-detail-qty ${m.quantity > 0 ? "positive" : "negative"}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} uds.
                    </span>
                  )}
                </div>
                {m.reason && (
                  <span className="correction-detail-reason">{m.reason}</span>
                )}
              </div>
            );
          })}
        </div>
      </td>
      <td>{group.userName}</td>
    </tr>
  );
}

export default AdjustmentsList;
