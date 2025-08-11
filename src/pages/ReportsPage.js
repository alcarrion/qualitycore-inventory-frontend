// src/pages/ReportsPage.js
import React, { useState } from "react";
import { FileText } from "lucide-react";
import { API_URL, generateReport } from "../services/api";
import { API_ROOT } from "../services/api";
import "../styles/pages/ReportsPage.css";

export default function ReportsPage() {
  const [tipo, setTipo] = useState("movements");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [urlReporte, setUrlReporte] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const generarReporte = async () => {
    setMensaje("");
    setUrlReporte(null);

    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      setMensaje("El rango de fechas es inválido (inicio > fin).");
      return;
    }

    try {
      const res = await generateReport({
        type: tipo,
        start_date: fechaInicio || null,
        end_date:  fechaFin || null,
      });

      if (res.ok && res.data?.url) {
        const fullUrl = res.data.url.startsWith("http")
          ? res.data.url
          : `${API_ROOT}${res.data.url}`;
        setUrlReporte(fullUrl);
        setMensaje(res.data.message || "Reporte generado correctamente.");
      } else {
        setMensaje(res.data?.detail || res.data?.message || `Error al generar el reporte (HTTP ${res.status})`);
      }
    } catch (e) {
      setMensaje(`Error al generar el reporte${e?.message ? ` (${e.message})` : ""}`);
    }
  };

  return (
    <div className="report-bg">
      <div className="report-card">
        <div className="report-title">Generador de Reportes</div>
        <div className="report-subtitle">Selecciona el tipo y el rango de fechas</div>

        <label className="report-label">Tipo de reporte:</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="report-select"
        >
          <option value="movements">Movimientos recientes</option>
          <option value="top_vendidos">Productos más vendidos</option>
        </select>

        <label className="report-label">Fecha de inicio:</label>
        <input
          type="date"
          className="report-input"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <label className="report-label">Fecha de fin:</label>
        <input
          type="date"
          className="report-input"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <button onClick={generarReporte} className="report-btn">⬇️ Generar Reporte PDF</button>

        {mensaje && <div className="report-msg"><FileText size={18} /> {mensaje}</div>}

        {urlReporte && (
          <div style={{ textAlign: "center" }}>
            <a href={urlReporte} target="_blank" rel="noopener noreferrer" className="report-pdf-link">
              📥 Descargar Reporte Generado
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
