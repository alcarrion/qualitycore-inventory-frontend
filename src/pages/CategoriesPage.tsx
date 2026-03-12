// pages/CategoriesPage.tsx
import React from "react";
import EntityPage from "../components/EntityPage";
import CategoryForm from "../components/CategoryForm";
import { getCategories, patchCategory } from "../services/api";
import { PERMISSIONS } from "../constants/roles";
import { ENTITIES } from "../constants/messages";
import type { EntityPageConfig, EntityItem } from "../components/EntityPage";

const CATEGORY_CONFIG: EntityPageConfig = {
  title: "CATEGORÍAS",
  entityLabel: ENTITIES.CATEGORY,
  emptyLabel: "categorías",
  searchPlaceholder: "Buscar categorías...",
  addButtonLabel: "AÑADIR CATEGORÍA",
  deleteTitle: "Eliminar Categoría",
  fetchFn: (page, search, ordering) => getCategories(page, search, ordering),
  patchFn: patchCategory,
  documentField: "name",
  formEntityProp: "category",
  FormComponent: CategoryForm,
  canAdd: PERMISSIONS.CAN_ADD_CATEGORY,
  canEdit: PERMISSIONS.CAN_EDIT_CATEGORY,
  canDelete: PERMISSIONS.CAN_DELETE_CATEGORY,
  renderDetails: (item: EntityItem) => (
    <div className="entity-main">
      <div className="entity-name">{item.name || "-"}</div>
    </div>
  ),
};

export default function CategoriesPage() {
  return <EntityPage config={CATEGORY_CONFIG} />;
}
