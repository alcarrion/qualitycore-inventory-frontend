// TransactionsPage/AdjustmentsList.tsx
import React, { useMemo, useState } from "react";
import { SlidersHorizontal, Pencil, FileText } from "lucide-react";
import type { Movement } from "../../types/models";

const REASON_PREVIEW_LENGTH = 120;

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= REASON_PREVIEW_LENGTH) return <>{text}</>;
  return (
    <>
      {expanded ? text : `${text.slice(0, REASON_PREVIEW_LENGTH)}...`}{" "}
      <button
        className="read-more-btn"
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
      >
        {expanded ? "Leer menos" : "Leer más"}
      </button>
    </>
  );
}

interface Props {
  movements: Movement[];
}

type SingleGroup = { type: 'single'; movement: Movement };
type CorrectionGroup = {
  type: 'correction-group';
  invoiceType: 'sale' | 'purchase';
  invoiceId: number;
  items: Movement[];
  date: string;
  userName: string;
};
type AdjustmentGroup = SingleGroup | CorrectionGroup;

function AdjustmentsList({ movements }: Props) {
  // El servidor ya filtra por tipo y búsqueda; solo agrupamos los resultados recibidos.
  const adjustments = useMemo(() =>
    movements.filter(
      (m) => m.movement_type === "adjustment" || m.movement_type === "correction"
    ),
  [movements]);

  const groups = useMemo((): AdjustmentGroup[] => {
    const result: AdjustmentGroup[] = [];
    const invoiceMap: Record<string, CorrectionGroup> = {};

    for (const m of adjustments) {
      if (m.movement_type === "correction") {
        const key = m.sale ? `sale-${m.sale}` : m.purchase ? `purchase-${m.purchase}` : null;
        if (key) {
          if (!invoiceMap[key]) {
            invoiceMap[key] = {
              type: "correction-group",
              invoiceType: m.sale ? "sale" : "purchase",
              invoiceId: (m.sale ?? m.purchase) as number,
              items: [],
              date: m.date,
              userName: m.user_name || "",
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
      return new Date(dateB).getTime() - new Date(dateA).getTime();
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
              <th className="text-center detalle-col">Detalle</th>
              <th>Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">
                  No hay ajustes ni correcciones registrados.
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

function renderAdjustmentRow(m: Movement) {
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
      <td className="detalle-col">
        <div className="correction-detail-item">
          <div className="correction-detail-main">
            <span className="correction-detail-product">{m.product_name}</span>
            <span className={`correction-detail-qty ${isPositive ? "positive" : "negative"}`}>
              {isPositive ? `+${m.quantity}` : m.quantity} uds.
            </span>
          </div>
          {m.reason && (
            <span className="correction-detail-reason">
              <ExpandableText text={m.reason} />
            </span>
          )}
        </div>
      </td>
      <td>{m.user_name}</td>
    </tr>
  );
}

function renderCorrectionGroupRow(group: CorrectionGroup) {
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
      <td className="detalle-col">
        <div className="correction-details-list">
          {group.items.map((m) => {
            const originalQty = m.original_quantity;
            const correctedQty = originalQty != null
              ? (m.purchase
                  ? originalQty + (m.quantity ?? 0)
                  : originalQty - (m.quantity ?? 0))
              : null;

            return (
              <div key={m.id} className="correction-detail-item">
                <div className="correction-detail-main">
                  <span className="correction-detail-product">{m.product_name}:</span>
                  {originalQty != null ? (
                    <span className="correction-detail-change">
                      <span className="correction-qty-original">{originalQty}</span>
                      <span className="correction-qty-arrow">→</span>
                      <span className={correctedQty !== null && correctedQty < originalQty ? "correction-qty-decreased" : "correction-qty-new"}>{correctedQty}</span>
                    </span>
                  ) : (
                    <span className={`correction-detail-qty ${m.quantity > 0 ? "positive" : "negative"}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} uds.
                    </span>
                  )}
                </div>
                {m.reason && (
                  <span className="correction-detail-reason">
                    <ExpandableText text={m.reason} />
                  </span>
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
