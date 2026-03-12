// src/mocks/handlers.ts
// Handlers MSW v1 para tests de integración.
// La URL base debe coincidir con REACT_APP_API_URL definido en .env.test
import { rest } from 'msw';

const BASE = 'http://localhost:8000/api';

export const handlers = [
  // CSRF — requerido por apiFetch en algunos flujos
  rest.get(`${BASE}/csrf/`, (_req, res, ctx) =>
    res(ctx.json({ csrfToken: 'test-csrf-token' }))
  ),

  // Token refresh — devuelve 401 en tests (no hay sesión real activa)
  rest.post(`${BASE}/token/refresh/`, (_req, res, ctx) =>
    res(ctx.status(401))
  ),

  // Clientes
  rest.get(`${BASE}/customers/`, (req, res, ctx) => {
    const search = req.url.searchParams.get('search') ?? '';
    const customers = [
      { id: 1, name: 'Ana García', email: 'ana@test.com', document: '123', phone: '555-0001' },
      { id: 2, name: 'Juan López', email: 'juan@test.com', document: '456', phone: '555-0002' },
    ];
    const results = search
      ? customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : customers;
    return res(ctx.json({ count: results.length, results, next: null, previous: null }));
  }),

  // Ventas
  rest.get(`${BASE}/sales/`, (_req, res, ctx) =>
    res(ctx.json({
      count: 2,
      results: [
        { id: 1, customer: 1, customer_name: 'Ana García', total: '150.00', date: '2026-02-28T10:00:00Z', user_name: 'Test User' },
        { id: 2, customer: 2, customer_name: 'Juan López', total: '80.00', date: '2026-02-28T11:00:00Z', user_name: 'Test User' },
      ],
      next: null,
      previous: null,
    }))
  ),

  // Compras
  rest.get(`${BASE}/purchases/`, (_req, res, ctx) =>
    res(ctx.json({
      count: 1,
      results: [
        { id: 1, supplier: 1, supplier_name: 'Proveedor Test', total: '500.00', date: '2026-02-28T09:00:00Z', user_name: 'Test User' },
      ],
      next: null,
      previous: null,
    }))
  ),

  // Movimientos (ajustes y correcciones)
  rest.get(`${BASE}/movements/`, (_req, res, ctx) =>
    res(ctx.json({ count: 0, results: [], next: null, previous: null }))
  ),

  // Productos (búsqueda lazy)
  rest.get(`${BASE}/products/`, (req, res, ctx) => {
    const search = req.url.searchParams.get('search') ?? '';
    const products = [
      { id: 1, name: 'Laptop HP', price: '800.00', current_stock: 10, supplier: 1 },
      { id: 2, name: 'Mouse Logitech', price: '25.00', current_stock: 50, supplier: 1 },
    ];
    const results = search
      ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      : products;
    return res(ctx.json({ count: results.length, results, next: null, previous: null }));
  }),

  // Proveedores
  rest.get(`${BASE}/suppliers/`, (_req, res, ctx) =>
    res(ctx.json({ count: 0, results: [], next: null, previous: null }))
  ),

  // Categorías
  rest.get(`${BASE}/categories/`, (_req, res, ctx) =>
    res(ctx.json({ count: 0, results: [], next: null, previous: null }))
  ),

  // Alertas
  rest.get(`${BASE}/alerts/`, (_req, res, ctx) =>
    res(ctx.json({ count: 0, results: [], next: null, previous: null }))
  ),

  // Dashboard
  rest.get(`${BASE}/dashboard/`, (_req, res, ctx) =>
    res(ctx.json({ total_sales: 0, total_purchases: 0, low_stock_count: 0 }))
  ),

  // POST venta
  rest.post(`${BASE}/sales/`, (_req, res, ctx) =>
    res(ctx.status(201), ctx.json({ id: 99, customer: 1, total: '150.00' }))
  ),

  // POST compra
  rest.post(`${BASE}/purchases/`, (_req, res, ctx) =>
    res(ctx.status(201), ctx.json({ id: 99, supplier: 1, total: '500.00' }))
  ),

  // Stock check
  rest.post(`${BASE}/stock-check/`, (_req, res, ctx) =>
    res(ctx.json({ all_available: true, unavailable: [] }))
  ),

  // Usuario actual (validación de sesión al arrancar)
  rest.get(`${BASE}/users/me/`, (_req, res, ctx) =>
    res(
      ctx.json({
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'admin',
      })
    )
  ),

  // Configuración de la app
  rest.get(`${BASE}/config/`, (_req, res, ctx) =>
    res(
      ctx.json({
        company_name: 'Empresa Test',
        tax_rate: { iva: 0.15 },
        currency: 'USD',
      })
    )
  ),
];
