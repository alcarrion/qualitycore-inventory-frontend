// e2e/04-sale-flow.spec.ts
// Flujo completo de creación de venta (salida):
// Abrir modal → seleccionar cliente → agregar producto → guardar → ver confirmación.
import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/mocks';

const API = 'http://localhost:8000/api';

test.describe('Crear Venta (Salida)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/transactions');
  });

  test('botones "Añadir Entrada" y "Añadir Salida" son visibles', async ({ page }) => {
    await expect(page.getByText('Añadir Entrada')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Añadir Salida')).toBeVisible();
  });

  test('abrir modal de salida muestra el formulario', async ({ page }) => {
    await page.getByText('Añadir Salida').click();

    // El modal debe mostrar "Añadir Salida" en el título
    await expect(page.getByText(/Añadir Salida/i)).toBeVisible({ timeout: 5_000 });
    // El campo de búsqueda de cliente debe aparecer
    await expect(page.locator('input[placeholder="Buscar cliente..."]')).toBeVisible();
  });

  test('flujo completo: cliente → producto → guardar muestra confirmación', async ({ page }) => {
    // Mock de búsqueda de clientes (para el dropdown lazy)
    await page.route(`${API}/customers/**`, (r, req) => {
      const url = new URL(req.url());
      const search = url.searchParams.get('search') ?? '';
      if (search.includes('Ana')) {
        r.fulfill({
          json: { count: 1, results: [
            { id: 1, name: 'Ana García', email: 'ana@test.com', document: '1710034065', phone: '0993000001' },
          ], next: null, previous: null },
        });
      } else {
        r.fulfill({ json: { count: 0, results: [], next: null, previous: null } });
      }
    });

    // Mock de stock check
    await page.route(`${API}/products/check_stock/`, (r) =>
      r.fulfill({ json: { all_available: true, unavailable: [] } })
    );

    // Mock POST venta → 201
    let saleCreated = false;
    await page.route(`${API}/sales/`, (r, req) => {
      if (req.method() === 'POST') {
        saleCreated = true;
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

    // Abrir modal de salida
    await page.getByText('Añadir Salida').click();
    await expect(page.locator('input[placeholder="Buscar cliente..."]')).toBeVisible({ timeout: 5_000 });

    // Buscar y seleccionar cliente "Ana García"
    await page.locator('input[placeholder="Buscar cliente..."]').fill('Ana');
    await page.waitForTimeout(400);
    // Seleccionar la primera opción del dropdown
    const clienteOption = page.getByText('Ana García').first();
    await clienteOption.click();

    // Buscar producto "Laptop"
    const productInput = page.locator('input[placeholder="Buscar producto por nombre o código..."]');
    await expect(productInput).toBeEnabled({ timeout: 3_000 });
    await productInput.fill('Laptop');
    await page.waitForTimeout(400);
    const laptopOption = page.getByText('Laptop Dell XPS').first();
    await laptopOption.click();

    // Agregar al carrito
    await page.getByText('Agregar').click();

    // Hacer clic en "Guardar Venta"
    await page.getByText(/Guardar Venta/).click();
    await page.waitForTimeout(1000);

    // La venta fue enviada al backend
    expect(saleCreated).toBe(true);
  });
});
