// e2e/02-dashboard.spec.ts
// Dashboard muestra métricas del sistema correctamente.
import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/mocks';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/dashboard');
  });

  test('muestra las 6 tarjetas de métricas', async ({ page }) => {
    // El dashboard renderiza tarjetas con labels específicos
    await expect(page.getByText('Productos Totales')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Ventas Totales')).toBeVisible();
    await expect(page.getByText('Clientes Registrados')).toBeVisible();
    await expect(page.getByText('Movimientos Totales')).toBeVisible();
    await expect(page.getByText('Entradas')).toBeVisible();
    await expect(page.getByText('Salidas')).toBeVisible();
  });

  test('muestra los valores numéricos del mock', async ({ page }) => {
    // Valores definidos en MOCK_DASHBOARD: total_products=3, total_sales=12
    await expect(page.getByText('3')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('12')).toBeVisible();
  });

  test('alerta de stock bajo es visible en el panel', async ({ page }) => {
    // El mock retorna una alerta de stock bajo para 'Teclado Mecánico'
    await expect(page.getByText(/Teclado Mecánico|stock bajo/i)).toBeVisible({ timeout: 8_000 });
  });
});
