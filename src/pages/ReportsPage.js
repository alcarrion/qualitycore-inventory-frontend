// src/pages/ReportsPage.js
import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { generateReport } from "../services/api"; // ✅ usamos wrapper
import "../styles/pages/ReportsPage.css";

export default function ReportsPage() {
  const [tipo, setTipo] = useState("movements");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [urlReporte, setUrlReporte] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // Limpia el blob URL cuando cambie o al desmontar
  useEffect(() => {
    return () => {
      if (urlReporte) URL.revokeObjectURL(urlReporte);
    };
  }, [urlReporte]);

  const generarReporte = async () => {
    setMensaje("");
    if (urlReporte) {
      URL.revokeObjectURL(urlReporte);
      setUrlReporte(null);
    }

    // Validación simple de fechas (opcional)
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      setMensaje("El rango de fechas es inválido (inicio > fin).");
      return;
    }

    try {
      const blob = await generateReport({
        type: tipo,
        start_date: fechaInicio || null,
        end_date: fechaFin || null,
      });
      // Si llega aquí, fue OK (apiFetchBlob lanza error en !res.ok)
      const blobUrl = URL.createObjectURL(blob);
      setUrlReporte(blobUrl);
      setMensaje("Reporte generado correctamente.");
    } catch (e) {
      // e.message normalmente viene como "Error 400/403/500"
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

        <button onClick={generarReporte} className="report-btn">
          ⬇️ Generar Reporte PDF
        </button>

        {mensaje && (
          <div className="report-msg">
            <FileText size={18} /> {mensaje}
          </div>
        )}

        {urlReporte && (
          <div style={{ textAlign: "center" }}>
            <a
              href={urlReporte}               // 👈 blob: URL (descarga/abre sin hardcodear host)
              target="_blank"
              rel="noopener noreferrer"
              className="report-pdf-link"
            >
              📥 Descargar Reporte Generado
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
