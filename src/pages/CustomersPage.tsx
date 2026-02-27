// src/pages/CustomersPage.tsx
import React from "react";
import EntityPage from "../components/EntityPage";
import CustomerForm from "../components/CustomerForm";
import { patchCustomer } from "../services/api";
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
  storeKey: "customers",
  fetchKey: "fetchCustomers",
  patchFn: patchCustomer,
  documentField: "document",
  formEntityProp: "customer",
  FormComponent: CustomerForm,
  canAdd: PERMISSIONS.CAN_ADD_CUSTOMER,
  canEdit: PERMISSIONS.CAN_EDIT_CUSTOMER,
  canDelete: PERMISSIONS.CAN_DELETE_CUSTOMER,
  filterFn: (item, search) => {
    const s = search.toLowerCase();
    return (
      (!!item.name && item.name.toLowerCase().includes(s)) ||
      (!!item["document"] && String(item["document"]).includes(search)) ||
      (!!item.phone && item.phone.includes(search)) ||
      (!!item.email && item.email.toLowerCase().includes(s)) ||
      (!!item.address && item.address.toLowerCase().includes(s))
    );
  },
};

export default function CustomersPage() {
  return <EntityPage config={CUSTOMER_CONFIG} />;
}
