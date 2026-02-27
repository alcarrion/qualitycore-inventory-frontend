// src/components/LoadingSpinner.tsx
import React from "react";
import "../styles/components/LoadingSpinner.css";

interface Props {
  size?: "small" | "medium" | "large";
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "medium",
  message = "",
  fullScreen = false,
}: Props) {
  const sizeClass = `spinner-${size}`;

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className={`spinner-circle ${sizeClass}`}></div>
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={`spinner-circle ${sizeClass}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}
