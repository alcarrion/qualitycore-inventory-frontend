// TransactionsPage/TransactionActions.js
import React from "react";
import { PackagePlus, PackageMinus } from "lucide-react";

/**
 * Componente que muestra los botones de acción para añadir entradas y salidas
 */
function TransactionActions({ onAddEntry, onAddExit }) {
  return (
    <div className="botonesAccion">
      <button
        onClick={onAddEntry}
        className="btn entradaBtn"
      >
        <PackagePlus size={18} />
        Añadir Entrada
      </button>
      <button
        onClick={onAddExit}
        className="btn salidaBtn"
      >
        <PackageMinus size={18} />
        Añadir Salida
      </button>
    </div>
  );
}

export default TransactionActions;
