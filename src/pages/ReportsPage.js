// src/pages/ReportsPage.js
import React, { useState } from "react";
import { getCookie, API_URL } from "../services/api";
import { FileText } from "lucide-react";
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

    const csrftoken = getCookie("csrftoken");

    try {
      const res = await fetch(`${API_URL}/reports/generate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({
          type: tipo,
          start_date: fechaInicio,
          end_date: fechaFin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUrlReporte(`http://localhost:8000${data.url}`);
        setMensaje(data.message);
      } else {
        setMensaje(data.message || "Error al generar el reporte");
      }
    } catch {
      setMensaje("Error de conexión con el servidor.");
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
              href={urlReporte}
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
