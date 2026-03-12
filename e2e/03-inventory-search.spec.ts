// e2e/03-inventory-search.spec.ts
// Búsqueda y filtros en InventoryPage.
import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/mocks';

const API = 'http://localhost:8000/api';

test.describe('InventoryPage — búsqueda y filtros', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/products');
  });

  test('muestra los 3 productos al cargar', async ({ page }) => {
    await expect(page.getByText('Laptop Dell XPS')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Mouse Logitech')).toBeVisible();
    await expect(page.getByText('Teclado Mecánico')).toBeVisible();
  });

  test('buscar por nombre filtra la lista', async ({ page }) => {
    // Interceptar la llamada con ?search= para devolver resultado filtrado
    await page.route(`${API}/products/**`, (r, req) => {
      const url = new URL(req.url());
      const search = url.searchParams.get('search') ?? '';
      if (search === 'Laptop') {
        r.fulfill({
          json: {
            count: 1,
            results: [{ id: 1, name: 'Laptop Dell XPS', category: 1, category_name: 'Tecnología',
                        supplier: 1, supplier_name: 'TechSupplies', price: '1200.00',
                        current_stock: 15, minimum_stock: 3, status: 'Activo', image: null }],
            next: null, previous: null,
          },
        });
      } else {
        r.fulfill({
          json: {
            count: 3,
            results: [
              { id: 1, name: 'Laptop Dell XPS', category: 1, category_name: 'Tecnología',
                supplier: 1, supplier_name: 'TechSupplies', price: '1200.00',
                current_stock: 15, minimum_stock: 3, status: 'Activo', image: null },
              { id: 2, name: 'Mouse Logitech', category: 1, category_name: 'Tecnología',
                supplier: 1, supplier_name: 'TechSupplies', price: '45.00',
                current_stock: 50, minimum_stock: 10, status: 'Activo', image: null },
              { id: 3, name: 'Teclado Mecánico', category: 1, category_name: 'Tecnología',
                supplier: 1, supplier_name: 'TechSupplies', price: '120.00',
                current_stock: 2, minimum_stock: 5, status: 'Activo', image: null },
            ],
            next: null, previous: null,
          },
        });
      }
    });

    await page.reload();
    await page.waitForTimeout(500);

    const searchInput = page.locator('input[placeholder="Buscar productos..."]');
    await expect(searchInput).toBeVisible({ timeout: 5_000 });
    await searchInput.fill('Laptop');

    // Esperar a que se aplique el debounce (300ms) + render
    await page.waitForTimeout(600);

    await expect(page.getByText('Laptop Dell XPS')).toBeVisible();
    await expect(page.getByText('Mouse Logitech')).not.toBeVisible();
    await expect(page.getByText('Teclado Mecánico')).not.toBeVisible();
  });

  test('limpiar filtros restaura la lista completa', async ({ page }) => {
    await expect(page.getByText('Laptop Dell XPS')).toBeVisible({ timeout: 8_000 });

    const searchInput = page.locator('input[placeholder="Buscar productos..."]');
    await searchInput.fill('xyz');
    await page.waitForTimeout(600);

    // Botón "Limpiar filtros"
    const clearBtn = page.locator('button.btn-clear-filters');
    await clearBtn.click();
    await page.waitForTimeout(600);

    // Los 3 productos deben volver a aparecer
    await expect(page.getByText('Laptop Dell XPS')).toBeVisible({ timeout: 5_000 });
  });
});
