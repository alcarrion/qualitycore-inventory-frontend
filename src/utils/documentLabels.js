// utils/documentLabels.js

const DOCUMENT_LABELS = {
  cedula: 'Cédula',
  ruc: 'RUC',
  passport: 'Pasaporte',
};

const DOCUMENT_PLACEHOLDERS = {
  cedula: '10 dígitos',
  ruc: '13 dígitos',
  passport: '6-9 caracteres alfanuméricos',
};

/** Retorna el nombre legible del tipo de documento */
export function getDocumentLabel(type) {
  return DOCUMENT_LABELS[type] || 'Documento';
}

/** Retorna el placeholder para el input según el tipo */
export function getDocumentPlaceholder(type) {
  return DOCUMENT_PLACEHOLDERS[type] || '';
}
