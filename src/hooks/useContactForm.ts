// hooks/useContactForm.ts
// Lógica compartida entre CustomerForm y SupplierForm.
import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { extractFormErrors } from "../utils/errorHandler";
import {
  validateEcuadorianCedula,
  validateEcuadorianRUC,
  validatePassport,
} from "../utils/ecuadorianValidators";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import type { Customer, Supplier, DocumentType } from "../types/models";
import type { ApiResponse } from "../types/api";

export interface ContactFormConfig {
  entityName: string;                        // 'Cliente' | 'Proveedor'
  entityKey: keyof typeof ENTITIES;          // 'CUSTOMER' | 'SUPPLIER'
  successLabel: string;                      // 'Cliente' | 'Proveedor' (para SUCCESS.CREATED/UPDATED)
  documentFieldKey: "document" | "tax_id";   // campo que varía entre Customer y Supplier
  defaultDocumentType: DocumentType;
  requiredFieldsError: string;
  postFn: (data: unknown) => Promise<ApiResponse>;
  patchFn: (id: number, data: unknown) => Promise<ApiResponse>;
}

export function useContactForm(
  entity: Customer | Supplier | null | undefined,
  config: ContactFormConfig,
  onSave?: (data: unknown) => void
) {
  const isEditing = !!entity;
  const { showSuccess, showError } = useApp();

  const initialDoc =
    config.documentFieldKey === "document"
      ? (entity as Customer | null)?.document ?? ""
      : (entity as Supplier | null)?.tax_id ?? "";

  const [name, setName] = useState(entity?.name ?? "");
  const [email, setEmail] = useState(entity?.email ?? "");
  const [documentType, setDocumentType] = useState<DocumentType>(
    entity?.document_type ?? config.defaultDocumentType
  );
  const [documentValue, setDocumentValue] = useState(initialDoc);
  const [phone, setPhone] = useState(entity?.phone ?? "");
  const [address, setAddress] = useState(entity?.address ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !documentValue || !phone || !documentType) {
      showError(config.requiredFieldsError);
      setLoading(false);
      return;
    }

    try {
      if (documentType === "cedula") {
        validateEcuadorianCedula(documentValue);
      } else if (documentType === "ruc") {
        validateEcuadorianRUC(documentValue);
      } else if (documentType === "passport") {
        validatePassport(documentValue);
      }
    } catch (error) {
      showError((error as Error).message);
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showError(ERRORS.PHONE_LENGTH);
      setLoading(false);
      return;
    }

    const data = {
      name,
      email,
      document_type: documentType,
      [config.documentFieldKey]: documentValue,
      phone,
      address,
    };

    try {
      const resp = isEditing
        ? await config.patchFn((entity as { id: number }).id, data)
        : await config.postFn(data);

      if (!resp.ok) {
        const fallback = isEditing
          ? ERRORS.UPDATE_FAILED(ENTITIES[config.entityKey])
          : ERRORS.CREATE_FAILED(ENTITIES[config.entityKey]);
        showError(extractFormErrors(resp.data, fallback));
        setLoading(false);
        return;
      }

      showSuccess(
        isEditing
          ? SUCCESS.UPDATED(config.successLabel)
          : SUCCESS.CREATED(config.successLabel)
      );
      onSave?.(resp.data);
    } catch (err) {
      const fallback = isEditing
        ? ERRORS.UPDATE_FAILED(ENTITIES[config.entityKey])
        : ERRORS.CREATE_FAILED(ENTITIES[config.entityKey]);
      showError((err as Error).message || fallback);
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditing,
    name, setName,
    email, setEmail,
    documentType, setDocumentType,
    documentValue, setDocumentValue,
    phone, setPhone,
    address, setAddress,
    loading,
    handleSubmit,
  };
}
