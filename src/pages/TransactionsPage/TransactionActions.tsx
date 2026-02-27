// TransactionsPage/TransactionActions.tsx
import React from "react";
import { PackagePlus, PackageMinus } from "lucide-react";

interface Props {
  onAddEntry: () => void;
  onAddExit: () => void;
}

function TransactionActions({ onAddEntry, onAddExit }: Props) {
  return (
    <div className="botonesAccion">
      <button onClick={onAddEntry} className="btn entradaBtn">
        <PackagePlus size={18} />
        Añadir Entrada
      </button>
      <button onClick={onAddExit} className="btn salidaBtn">
        <PackageMinus size={18} />
        Añadir Salida
      </button>
    </div>
  );
}

export default TransactionActions;
