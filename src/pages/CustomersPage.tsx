// src/pages/CustomersPage.tsx
import React from "react";
import EntityPage from "../components/EntityPage";
import CustomerForm from "../components/CustomerForm";
import { getCustomers, patchCustomer } from "../services/api";
import { PERMISSIONS } from "../constants/roles";
import { ENTITIES } from "../constants/messages";
import type { EntityPageConfig } from "../components/EntityPage";

const CUSTOMER_CONFIG: EntityPageConfig = {
  title: "CLIENTES",
  entityLabel: ENTITIES.CUSTOMER,
  emptyLabel: "clientes",
  searchPlaceholder: "Buscar clientes...",
  addButtonLabel: "AÑADIR CLIENTES",
  deleteTitle: "Eliminar Cliente",
  fetchFn: (page, search, ordering) => getCustomers(page, search, ordering),
  patchFn: patchCustomer,
  documentField: "document",
  formEntityProp: "customer",
  FormComponent: CustomerForm,
  canAdd: PERMISSIONS.CAN_ADD_CUSTOMER,
  canEdit: PERMISSIONS.CAN_EDIT_CUSTOMER,
  canDelete: PERMISSIONS.CAN_DELETE_CUSTOMER,
};

export default function CustomersPage() {
  return <EntityPage config={CUSTOMER_CONFIG} />;
}
