// src/components/QuotedProductRow.tsx
// Fila de producto cotizado para QuotationPage. Exportada como componente propio.
import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";
import { useLazyDropdown } from "../hooks/useLazyDropdown";
import { useProductSearch } from "../hooks/useProductSearch";
import type { Product } from "../types/models";

export interface QuotedProduct {
  product: string;
  quantity: number | string;
  unit_price: number | string;
  subtotal: number;
}

interface RowProps {
  item: QuotedProduct;
  index: number;
  onProductSelect: (index: number, productId: string, price: number) => void;
  onProductChange: (index: number, field: string, value: string) => void;
  onRemove: () => void;
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => void;
}

export function QuotedProductRow({
  item,
  index,
  onProductSelect,
  onProductChange,
  onRemove,
  onWheel,
}: RowProps) {
  const [productSearchText, setProductSearchText] = useState("");
  const { products } = useProductSearch(productSearchText);
  const { dropdown: productDropdown, confirmSelection } = useLazyDropdown<Product>(
    products,
    setProductSearchText
  );

  const handleSelectProduct = useCallback(
    (product: Product) => {
      confirmSelection(product, product.name);
      onProductSelect(index, String(product.id), Number(product.price) || 0);
    },
    [confirmSelection, onProductSelect, index]
  );

  const renderProductItem = useCallback(
    (p: Product) => (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: "500" }}>{p.name}</div>
        </div>
        <div style={{ textAlign: "right", marginLeft: "12px" }}>
          <div style={{ fontSize: "0.85em", fontWeight: "500", color: "var(--primary-color)" }}>
            ${parseFloat(String(p.price)).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.75em", color: "var(--text-secondary)" }}>
            Stock: {p.current_stock}
          </div>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="cotiz-prod-row">
      <SearchableDropdown
        dropdown={productDropdown}
        onSelect={handleSelectProduct}
        onDeselect={() => onProductChange(index, "product", "")}
        placeholder="Buscar producto..."
        emptyMessage="No se encontraron productos"
        maxItems={10}
        renderItem={renderProductItem}
        className="cotiz-prod-search"
      />
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(e) => onProductChange(index, "quantity", e.target.value)}
        onWheel={onWheel}
        className="cotiz-input"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={item.unit_price}
        onChange={(e) => onProductChange(index, "unit_price", e.target.value)}
        onWheel={onWheel}
        className="cotiz-input"
      />
      <input
        type="text"
        readOnly
        value={Number(item.subtotal || 0).toFixed(2)}
        className="cotiz-input"
      />
      <button type="button" onClick={onRemove} className="cotiz-remove-btn">
        <X size={18} />
      </button>
    </div>
  );
}
