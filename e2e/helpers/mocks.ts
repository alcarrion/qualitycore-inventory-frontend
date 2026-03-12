// e2e/helpers/mocks.ts
// Helpers para mockear la API REST en tests Playwright usando page.route().
// Evita necesitar el backend corriendo durante E2E.
import type { Page } from '@playwright/test';

const API = 'http://localhost:8000/api';

// --------------------------------------------------------------------------
// Usuario mock de sesión (Admin)
// --------------------------------------------------------------------------
export const MOCK_USER = {
  id: 1,
  email: 'admin@test.com',
  name: 'Admin Test',
  role: 'Administrator',
  phone: '0991234567',
  is_active: true,
};

// --------------------------------------------------------------------------
// Datos maestros de muestra
// --------------------------------------------------------------------------
const MOCK_PRODUCTS = [
  { id: 1, name: 'Laptop Dell XPS', category: 1, category_name: 'Tecnología', supplier: 1,
    supplier_name: 'TechSupplies', price: '1200.00', current_stock: 15, minimum_stock: 3,
    status: 'Activo', image: null },
  { id: 2, name: 'Mouse Logitech', category: 1, category_name: 'Tecnología', supplier: 1,
    supplier_name: 'TechSupplies', price: '45.00', current_stock: 50, minimum_stock: 10,
    status: 'Activo', image: null },
  { id: 3, name: 'Teclado Mecánico', category: 1, category_name: 'Tecnología', supplier: 1,
    supplier_name: 'TechSupplies', price: '120.00', current_stock: 2, minimum_stock: 5,
    status: 'Activo', image: null },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Tecnología' },
  { id: 2, name: 'Oficina' },
];

const MOCK_SUPPLIERS = [
  { id: 1, name: 'TechSupplies', email: 'ts@test.com', phone: '0997000001', tax_id: '1710034065001' },
];

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Ana García', email: 'ana@test.com', document: '1710034065', phone: '0993000001' },
];

const MOCK_DASHBOARD = {
  total_products: 3,
  total_sales: 12,
  total_customers: 8,
  total_movements: 24,
  total_entries: 14,
  total_exits: 10,
  low_stock_products: 1,
};

// --------------------------------------------------------------------------
// Función principal: registra todos los mocks necesarios para una sesión autenticada
// --------------------------------------------------------------------------
export async function mockAuthenticatedSession(page: Page): Promise<void> {
  // Simular usuario ya logueado via localStorage (evita pasar por LoginPage)
  await page.addInitScript((user) => {
    localStorage.setItem('user', JSON.stringify(user));
  }, MOCK_USER);

  await mockAllApiRoutes(page);
}

export async function mockAllApiRoutes(page: Page): Promise<void> {
  // CSRF
  await page.route(`${API}/csrf/`, (r) =>
    r.fulfill({ json: { csrfToken: 'e2e-csrf-token' } })
  );

  // Auth: getMe — valida sesión al arrancar
  await page.route(`${API}/users/me/`, (r) =>
    r.fulfill({ json: MOCK_USER })
  );

  // Token refresh — no hay refresh en E2E
  await page.route(`${API}/token/refresh/`, (r) =>
    r.fulfill({ status: 401, json: { detail: 'No session' } })
  );

  // Dashboard
  await page.route(`${API}/dashboard/summary/`, (r) =>
    r.fulfill({ json: MOCK_DASHBOARD })
  );

  // Productos (con soporte de ?search=)
  await page.route(`${API}/products/**`, (r, req) => {
    const url = new URL(req.url());
    const search = url.searchParams.get('search') ?? '';
    const results = search
      ? MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      : MOCK_PRODUCTS;
    r.fulfill({ json: { count: results.length, results, next: null, previous: null } });
  });

  // Categorías
  await page.route(`${API}/categories/**`, (r) =>
    r.fulfill({ json: { count: MOCK_CATEGORIES.length, results: MOCK_CATEGORIES, next: null, previous: null } })
  );

  // Proveedores
  await page.route(`${API}/suppliers/**`, (r) =>
    r.fulfill({ json: { count: MOCK_SUPPLIERS.length, results: MOCK_SUPPLIERS, next: null, previous: null } })
  );

  // Clientes
  await page.route(`${API}/customers/**`, (r) =>
    r.fulfill({ json: { count: MOCK_CUSTOMERS.length, results: MOCK_CUSTOMERS, next: null, previous: null } })
  );

  // Alertas
  await page.route(`${API}/alerts/**`, (r) =>
    r.fulfill({ json: [{ id: 1, product_id: 3, product_name: 'Teclado Mecánico', type: 'low_stock',
                         message: 'Stock bajo', is_active: true }] })
  );

  // Ventas
  await page.route(`${API}/sales/**`, (r, req) => {
    if (req.method() === 'POST') {
      r.fulfill({
        status: 201,
        json: {
          message: 'Venta creada exitosamente.',
          sale: { id: 99, customer: 1, customer_name: 'Ana García',
                  total: '1200.00', date: new Date().toISOString(), movements: [] },
        },
      });
    } else {
      r.fulfill({ json: { count: 0, results: [], next: null, previous: null } });
    }
  });

  // Compras
  await page.route(`${API}/purchases/**`, (r, req) => {
    if (req.method() === 'POST') {
      r.fulfill({
        status: 201,
        json: {
          message: 'Compra creada exitosamente.',
          purchase: { id: 99, supplier: 1, supplier_name: 'TechSupplies',
                      total: '500.00', date: new Date().toISOString(), movements: [] },
        },
      });
    } else {
      r.fulfill({ json: { count: 0, results: [], next: null, previous: null } });
    }
  });

  // Movimientos
  await page.route(`${API}/movements/**`, (r) =>
    r.fulfill({ json: { count: 0, results: [], next: null, previous: null } })
  );

  // App config
  await page.route(`${API}/config/`, (r) =>
    r.fulfill({
      json: {
        tax_rate: { iva: 0.15 },
        pagination: { default_page_size: 10, page_size_options: [10, 25, 50] },
        validation: { phone_length: 10, password_min_length: 8 },
        timeouts: { toast_default: 3000, toast_short: 2000, toast_long: 5000,
                    message_display: 4000, redirect_delay: 1500, polling_interval: 3000, clock_interval: 1000 },
        image: { max_size_mb: 5, max_size_bytes: 5242880, allowed_types: ['image/jpeg', 'image/png'] },
        limits: { max_product_price: 9999999.99, max_quantity: 99999 },
      },
    })
  );

  // Stock check
  await page.route(`${API}/products/check_stock/`, (r) =>
    r.fulfill({ json: { all_available: true, unavailable: [] } })
  );

  // Quotation / PDF
  await page.route(`${API}/quotations/**`, (r, req) => {
    if (req.method() === 'POST') {
      r.fulfill({ status: 201, json: { id: 1, task_id: 'task-abc', status: 'pending' } });
    } else {
      r.fulfill({ json: { status: 'done', pdf_url: '/media/quotations/test.pdf' } });
    }
  });
  await page.route(`${API}/reports/**`, (r) =>
    r.fulfill({ json: { status: 'done', pdf_url: '/media/reports/test.pdf' } })
  );
}
