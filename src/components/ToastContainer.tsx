// src/components/ToastContainer.tsx
import React from "react";
import Toast from "./Toast";
import "../styles/components/ToastContainer.css";
import type { Toast as ToastType } from "../types/ui";

interface Props {
  toasts: ToastType[];
  removeToast: (id: number) => void;
}

export default function ToastContainer({ toasts, removeToast }: Props) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
