// src/pages/SuppliersPage.tsx
import React from "react";
import EntityPage from "../components/EntityPage";
import SupplierForm from "../components/SupplierForm";
import { getSuppliers, patchSupplier } from "../services/api";
import { PERMISSIONS } from "../constants/roles";
import { ENTITIES } from "../constants/messages";
import type { EntityPageConfig } from "../components/EntityPage";

const SUPPLIER_CONFIG: EntityPageConfig = {
  title: "PROVEEDORES",
  entityLabel: ENTITIES.SUPPLIER,
  emptyLabel: "proveedores",
  searchPlaceholder: "Buscar proveedores...",
  addButtonLabel: "AÑADIR PROVEEDOR",
  deleteTitle: "Eliminar Proveedor",
  fetchFn: (page, search, ordering) => getSuppliers(page, search, ordering),
  patchFn: patchSupplier,
  documentField: "tax_id",
  formEntityProp: "supplier",
  FormComponent: SupplierForm,
  canAdd: PERMISSIONS.CAN_ADD_SUPPLIER,
  canEdit: PERMISSIONS.CAN_EDIT_SUPPLIER,
  canDelete: PERMISSIONS.CAN_DELETE_SUPPLIER,
};

export default function SuppliersPage() {
  return <EntityPage config={SUPPLIER_CONFIG} />;
}
