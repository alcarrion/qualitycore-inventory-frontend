// utils/documentLabels.ts
import type { DocumentType } from '../types/models';

const DOCUMENT_LABELS: Record<string, string> = {
  cedula: 'Cédula',
  ruc: 'RUC',
  passport: 'Pasaporte',
};

const DOCUMENT_PLACEHOLDERS: Record<string, string> = {
  cedula: '10 dígitos',
  ruc: '13 dígitos',
  passport: '6-9 caracteres alfanuméricos',
};

/** Retorna el nombre legible del tipo de documento */
export function getDocumentLabel(type: DocumentType | string): string {
  return DOCUMENT_LABELS[type] || 'Documento';
}

/** Retorna el placeholder para el input según el tipo */
export function getDocumentPlaceholder(type: DocumentType | string): string {
  return DOCUMENT_PLACEHOLDERS[type] || '';
}
