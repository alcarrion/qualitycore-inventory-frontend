// src/components/CustomerForm.tsx
import React from "react";
import { postCustomer, patchCustomer } from "../services/api";
import { useContactForm } from "../hooks/useContactForm";
import { ContactFormUI } from "./ContactFormUI";
import { ERRORS } from "../constants/messages";
import type { Customer } from "../types/models";
import type { ContactFormConfig } from "../hooks/useContactForm";

const CUSTOMER_CONFIG: ContactFormConfig = {
  entityName: "Cliente",
  entityKey: "CUSTOMER",
  successLabel: "Cliente",
  documentFieldKey: "document",
  defaultDocumentType: "cedula",
  requiredFieldsError: ERRORS.REQUIRED_FIELDS,
  postFn: (data) => postCustomer(data as Parameters<typeof postCustomer>[0]),
  patchFn: (id, data) => patchCustomer(id, data as Parameters<typeof patchCustomer>[1]),
};

interface Props {
  customer?: Customer | null;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

export default function CustomerForm({ customer = null, onSave, onCancel }: Props) {
  const form = useContactForm(customer, CUSTOMER_CONFIG, onSave);
  const title = form.isEditing ? "Editar cliente" : "Añadir nuevo cliente";
  return <ContactFormUI form={form} title={title} onCancel={onCancel} />;
}
