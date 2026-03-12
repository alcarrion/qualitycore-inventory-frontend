// src/hooks/useProductForm.ts
// Gestiona el estado de campos de texto, imagen y la lógica de submit de ProductForm.
import { useState } from "react";
import type { ChangeEvent, WheelEvent } from "react";
import { postProduct, patchProduct } from "../services/api";
import { useApp } from "../contexts/AppContext";
import { validateImage } from "../utils/validateImage";
import { clearProductCache } from "./useProductSearch";
import { ERRORS, SUCCESS, ENTITIES } from "../constants/messages";
import type { Product } from "../types/models";

export function useProductForm(
  product: Product | null | undefined,
  onSave: (data: unknown) => void
) {
  const isEditing = !!product;
  const { showSuccess, showError } = useApp();

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState<string | number>(product?.price || "");
  const [minimumStock, setMinimumStock] = useState<string | number>(
    product?.minimum_stock ?? ""
  );
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isValid = await validateImage(file, showError);
    if (isValid) {
      setImage(file);
    } else {
      e.target.value = "";
      setImage(null);
    }
  };

  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).blur();
  };

  // categoryId, supplierId, statusValue vienen del hook useProductDropdowns
  const submit = async (
    categoryId: string,
    supplierId: string,
    statusValue: string
  ) => {
    setLoading(true);

    if (!name || !price || !minimumStock || !categoryId || !supplierId) {
      showError(ERRORS.REQUIRED_FIELDS);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    formData.append("category", String(categoryId));
    formData.append("price", String(price));
    formData.append("minimum_stock", String(minimumStock));
    formData.append("status", statusValue);
    formData.append("supplier", String(supplierId));
    if (image) formData.append("image", image);

    try {
      const res = isEditing
        ? await patchProduct(product!.id, formData)
        : await postProduct(formData);

      if (!res.ok) {
        if (
          res.data &&
          typeof res.data === "object" &&
          !(res.data as { detail?: string }).detail
        ) {
          const errorMessages = Object.entries(
            res.data as unknown as Record<string, unknown>
          )
            .map(([, messages]) => {
              if (Array.isArray(messages)) return messages.join(", ");
              return String(messages);
            })
            .join(". ");
          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
            : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
          showError(errorMessages || errorMsg);
        } else {
          const errorMsg = isEditing
            ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
            : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
          showError(
            (res.data as { detail?: string } | null)?.detail || errorMsg
          );
        }
        setLoading(false);
        return;
      }

      clearProductCache(); // invalidar caché para que dropdowns reflejen el producto nuevo/editado
      showSuccess(
        isEditing ? SUCCESS.UPDATED("Producto") : SUCCESS.CREATED("Producto")
      );
      onSave(res.data);
    } catch (e) {
      const errorMsg = isEditing
        ? ERRORS.UPDATE_FAILED(ENTITIES.PRODUCT)
        : ERRORS.CREATE_FAILED(ENTITIES.PRODUCT);
      showError((e as Error).message || errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    minimumStock,
    setMinimumStock,
    image,
    handleFileChange,
    handleWheel,
    loading,
    submit,
  };
}
