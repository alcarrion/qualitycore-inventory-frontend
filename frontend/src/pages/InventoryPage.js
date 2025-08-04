// src/pages/InventoryPage.js
import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import AddProductForm from "../components/AddProductForm";
import EditProductForm from "../components/EditProductForm";
import { API_URL, getCookie } from "../services/api";
import { FaPlus, FaSearch } from "react-icons/fa";
import "../styles/pages/InventoryPage.css";

export default function InventoryPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "Administrator";
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const loadProducts = () => {
    fetch(`${API_URL}/products/`, {
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.filter((p) => !p.deleted_at)))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    loadProducts();
  }, [showAdd, showEdit]);

  useEffect(() => {
    const handleReload = () => loadProducts();
    window.addEventListener("recargarInventario", handleReload);
    return () => window.removeEventListener("recargarInventario", handleReload);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/suppliers/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSuppliers(data.filter((p) => !p.deleted_at)))
      .catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/categories/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const productsWithNames = products.map((p) => {
    const cat = categories.find((c) => c.id === p.category);
    const prov = suppliers.find((s) => s.id === p.supplier);
    return {
      ...p,
      category_name: cat ? cat.name : "-",
      supplier_name: prov ? prov.name : "-",
    };
  });

  const filtered = productsWithNames.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.supplier_name && p.supplier_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (product) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    fetch(`${API_URL}/products/${product.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    })
      .then((res) => res.json())
      .then(() => setProducts((prev) => prev.filter((p) => p.id !== product.id)));
  };

  return (
    <div className="inventory-page-container">
      <div className="inventory-header">
        <h2>INVENTARIO</h2>
      </div>
      <div className="inventory-actions">
        <div className="inventory-search-bar">
          <FaSearch />
          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button className="btn-add-product" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR PRODUCTO
          </button>
        )}
      </div>
      <div className="product-list">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            producto={product}
            isAdmin={isAdmin}
            onEdit={(p) => {
              setEditingProduct(p);
              setShowEdit(true);
            }}
            onDelete={(p) => handleDelete(p)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="no-data">No hay productos para mostrar.</div>
        )}
      </div>
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddProductForm
            proveedores={suppliers}
            categorias={categories}
            onSave={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
            recargarCategorias={() => {
              fetch(`${API_URL}/categories/`, { credentials: "include" })
                .then((res) => res.json())
                .then((data) => setCategories(data));
            }}
          />
        </Modal>
      )}
      {showEdit && editingProduct && (
        <Modal onClose={() => {
          setShowEdit(false);
          setEditingProduct(null);
        }}>
          <EditProductForm
            producto={editingProduct}
            proveedores={suppliers}
            categorias={categories}
            onSave={() => {
              setShowEdit(false);
              setEditingProduct(null);
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingProduct(null);
            }}
            recargarCategorias={() => {
              fetch(`${API_URL}/categories/`, { credentials: "include" })
                .then((res) => res.json())
                .then((data) => setCategories(data));
            }}
          />
        </Modal>
      )}
    </div>
  );
}
