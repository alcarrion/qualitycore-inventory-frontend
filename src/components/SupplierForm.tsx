// src/components/SupplierForm.tsx
import React from "react";
import { postSupplier, patchSupplier } from "../services/api";
import { useContactForm } from "../hooks/useContactForm";
import { ContactFormUI } from "./ContactFormUI";
import { ERRORS } from "../constants/messages";
import type { Supplier } from "../types/models";
import type { ContactFormConfig } from "../hooks/useContactForm";

const SUPPLIER_CONFIG: ContactFormConfig = {
  entityName: "Proveedor",
  entityKey: "SUPPLIER",
  successLabel: "Proveedor",
  documentFieldKey: "tax_id",
  defaultDocumentType: "ruc",
  requiredFieldsError: ERRORS.REQUIRED_FIELDS_EXCEPT_ADDRESS,
  postFn: (data) => postSupplier(data as Parameters<typeof postSupplier>[0]),
  patchFn: (id, data) => patchSupplier(id, data as Parameters<typeof patchSupplier>[1]),
};

interface Props {
  supplier?: Supplier | null;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

export default function SupplierForm({ supplier = null, onSave, onCancel }: Props) {
  const form = useContactForm(supplier, SUPPLIER_CONFIG, onSave);
  const title = form.isEditing ? "Editar proveedor" : "Añadir nuevo proveedor";
  return <ContactFormUI form={form} title={title} onCancel={onCancel} />;
}
