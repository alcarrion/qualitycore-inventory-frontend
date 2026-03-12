// e2e/01-login.spec.ts
// Flujo de login: formulario → API → redirección al dashboard.
import { test, expect } from '@playwright/test';
import { mockAllApiRoutes, MOCK_USER } from './helpers/mocks';

const API = 'http://localhost:8000/api';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar sesión almacenada (asegura que arranque en LoginPage)
    await page.addInitScript(() => localStorage.clear());
    await mockAllApiRoutes(page);
  });

  test('formulario de login es visible al arrancar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login exitoso redirige al dashboard', async ({ page }) => {
    // Mock del endpoint de login — devuelve usuario autenticado
    await page.route(`${API}/login/`, (r) =>
      r.fulfill({
        json: { user: MOCK_USER },
        headers: { 'Set-Cookie': 'access=fake-jwt; Path=/' },
      })
    );

    await page.goto('/');

    await page.locator('input[type="email"]').fill(MOCK_USER.email);
    await page.locator('input[type="password"]').fill('TestPass1!');
    await page.locator('button[type="submit"]').click();

    // Tras login exitoso la app navega a /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('credenciales incorrectas muestra error y no redirige', async ({ page }) => {
    await page.route(`${API}/login/`, (r) =>
      r.fulfill({ status: 401, json: { detail: 'Credenciales inválidas.' } })
    );

    await page.goto('/');

    await page.locator('input[type="email"]').fill('malo@test.com');
    await page.locator('input[type="password"]').fill('wrongpass');
    await page.locator('button[type="submit"]').click();

    // Permanece en login (URL no cambia a /dashboard)
    await page.waitForTimeout(1000);
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('usuario ya logueado es redirigido automáticamente al dashboard', async ({ page }) => {
    // Simular usuario en localStorage
    await page.addInitScript((user) => {
      localStorage.setItem('user', JSON.stringify(user));
    }, MOCK_USER);

    await page.goto('/');
    // LoginPage detecta user en storage y navega a /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});
