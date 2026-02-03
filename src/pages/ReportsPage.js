// src/pages/ReportsPage.js
import React, { useState } from "react";
import { generateReport } from "../services/api";
import { API_ROOT } from "../services/api";
import { useApp } from "../contexts/AppContext";
import "../styles/pages/ReportsPage.css";

export default function ReportsPage() {
  const { showSuccess, showError } = useApp();
  const [type, setType] = useState("movements");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportUrl, setReportUrl] = useState(null);

  const generateReportPdf = async () => {
    setReportUrl(null);

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showError("El rango de fechas es inválido (inicio > fin).");
      return;
    }

    try {
      const res = await generateReport({
        type: type,
        start_date: startDate || null,
        end_date: endDate || null,
      });

      if (res.ok && res.data?.url) {
        const fullUrl = res.data.url.startsWith("http")
          ? res.data.url
          : `${API_ROOT}${res.data.url}`;
        setReportUrl(fullUrl);
        showSuccess(res.data.message || "Reporte generado correctamente.");
      } else {
        showError(res.data?.detail || res.data?.message || `Error al generar el reporte (HTTP ${res.status})`);
      }
    } catch (e) {
      showError(`Error al generar el reporte${e?.message ? ` (${e.message})` : ""}`);
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
        />

        <label className="report-label">Fecha de fin:</label>
        <input
          type="date"
          className="report-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button onClick={generateReportPdf} className="report-btn">Generar Reporte PDF</button>

        {reportUrl && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="report-pdf-link">
              Descargar Reporte Generado
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
