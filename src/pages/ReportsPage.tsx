// src/pages/ReportsPage.tsx
import React, { useState, useEffect } from "react";
import { FileDown } from "lucide-react";
import { generateReport, checkReportStatus, API_ROOT } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { usePolling, POLLING_TIMEOUT } from "../hooks/usePolling";
import { ERRORS } from "../constants/messages";
import "../styles/pages/ReportsPage.css";

export default function ReportsPage() {
  const { showSuccess, showError } = useApp();
  const [type, setType] = useState("movements");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const reportPolling = usePolling(checkReportStatus);

  useEffect(() => {
    if (reportPolling.result) {
      const fullUrl = reportPolling.result.startsWith("http")
        ? reportPolling.result
        : `${API_ROOT}${reportPolling.result}`;
      setReportUrl(fullUrl);
      showSuccess("Reporte generado correctamente.");
    }
  }, [reportPolling.result, showSuccess]);

  useEffect(() => {
    if (reportPolling.error) {
      if (reportPolling.error === POLLING_TIMEOUT) {
        showError("El reporte tardó demasiado en generarse. Intenta nuevamente.");
      } else {
        showError(reportPolling.error);
      }
    }
  }, [reportPolling.error, showError]);

  const generateReportPdf = async () => {
    setReportUrl(null);
    reportPolling.stop();

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showError(ERRORS.INVALID_DATE_RANGE);
      return;
    }

    try {
      const res = await generateReport({
        type: type,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      if (res.ok && (res.data as { task_id?: string } | null)?.task_id) {
        reportPolling.start((res.data as { task_id: string }).task_id);
      } else {
        const d = res.data as { detail?: string; message?: string } | null;
        showError(d?.detail || d?.message || `Error al generar el reporte (HTTP ${res.status})`);
      }
    } catch (e) {
      showError(`Error al generar el reporte${(e as Error)?.message ? ` (${(e as Error).message})` : ""}`);
    }
  };

  return (
    <div className="report-bg">
      <div className="report-card">
        <div className="report-title">Generador de Reportes</div>
        <div className="report-subtitle">Selecciona el tipo y el rango de fechas</div>

        <label className="report-label">Tipo de reporte:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="report-select"
          disabled={reportPolling.isPolling}
        >
          <option value="movements">Movimientos recientes</option>
          <option value="top_vendidos">Productos más vendidos</option>
        </select>

        <label className="report-label">Fecha de inicio:</label>
        <input
          type="date"
          className="report-input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={reportPolling.isPolling}
        />

        <label className="report-label">Fecha de fin:</label>
        <input
          type="date"
          className="report-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={reportPolling.isPolling}
        />

        <button
          onClick={generateReportPdf}
          className="report-btn"
          disabled={reportPolling.isPolling}
        >
          {reportPolling.isPolling ? "Generando reporte..." : "Generar Reporte PDF"}
        </button>

        {reportUrl && (
          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="report-pdf-link">
            <FileDown size={16} />
            Descargar Reporte PDF
          </a>
        )}
      </div>
    </div>
  );
}
