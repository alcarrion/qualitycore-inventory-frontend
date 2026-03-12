// src/hooks/useQuotationPDF.ts
// Gestiona la generación de PDF (llamada a API + polling de Celery) y la URL resultante.
import { useState, useEffect } from "react";
import { getQuotationPDF, checkPDFStatus } from "../services/api";
import { usePolling, POLLING_TIMEOUT } from "./usePolling";
import { useApp } from "../contexts/AppContext";
import { ERRORS, SUCCESS } from "../constants/messages";

export function useQuotationPDF() {
  const { showSuccess, showError } = useApp();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfPolling = usePolling(checkPDFStatus);

  useEffect(() => {
    if (pdfPolling.result) {
      showSuccess(SUCCESS.PDF_GENERATED);
      const apiUrl = process.env.REACT_APP_API_URL ?? "";
      setPdfUrl(`${apiUrl.replace(/\/api\/?$/, "")}${pdfPolling.result}`);
    }
  }, [pdfPolling.result, showSuccess]);

  useEffect(() => {
    if (pdfPolling.error) {
      if (pdfPolling.error === POLLING_TIMEOUT) {
        showError("Tiempo de espera agotado generando el PDF. Intenta de nuevo.");
      } else {
        showError(ERRORS.PDF_GENERATION_FAILED(pdfPolling.error));
      }
    }
  }, [pdfPolling.error, showError]);

  // Solicita la generación del PDF para una cotización dada.
  // Devuelve true si el polling arrancó correctamente.
  const startPDFGeneration = async (quotationId: number): Promise<boolean> => {
    const pdfResponse = await getQuotationPDF(quotationId);
    if (
      pdfResponse.ok &&
      (pdfResponse.data as { task_id?: string } | null)?.task_id
    ) {
      pdfPolling.start((pdfResponse.data as { task_id: string }).task_id);
      return true;
    }
    return false;
  };

  const resetPDF = () => {
    pdfPolling.stop();
    setPdfUrl(null);
  };

  return {
    pdfUrl,
    startPDFGeneration,
    resetPDF,
    isPolling: pdfPolling.isPolling,
    pdfElapsedSeconds: pdfPolling.elapsedSeconds,
  };
}
