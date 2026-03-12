// src/__tests__/integration/customers.api.test.ts
// Tests de integración para el servicio getCustomers().
// MSW intercepta las llamadas a fetch — no se necesita un servidor real.
import { server } from '../../mocks/server';
import { rest } from 'msw';
import { getCustomers } from '../../services/api';

const BASE = 'http://localhost:8000/api';

describe('getCustomers — integración API', () => {
  test('devuelve la lista de clientes en respuesta exitosa', async () => {
    const res = await getCustomers(1);

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    const data = res.data as { count: number; results: unknown[] };
    expect(data.count).toBe(2);
    expect(data.results).toHaveLength(2);
  });

  test('incluye ?search= en la URL cuando se pasa el parámetro search', async () => {
    let capturedUrl = '';
    server.use(
      rest.get(`${BASE}/customers/`, (req, res, ctx) => {
        capturedUrl = req.url.toString();
        const search = req.url.searchParams.get('search') ?? '';
        const results = search === 'Ana'
          ? [{ id: 1, name: 'Ana García', email: 'ana@test.com', document: '123', phone: '555-0001' }]
          : [];
        return res(ctx.json({ count: results.length, results, next: null, previous: null }));
      })
    );

    const res = await getCustomers(1, 'Ana');

    expect(capturedUrl).toContain('search=Ana');
    expect(res.ok).toBe(true);
    const data = res.data as { count: number; results: unknown[] };
    expect(data.results).toHaveLength(1);
  });

  test('devuelve ok=false cuando el servidor responde con error 404', async () => {
    // Usamos 404 (no 500) porque los 5xx activan reintentos con backoff exponencial
    // que superarían el timeout de Jest (5s). Los 4xx no son reintentables.
    server.use(
      rest.get(`${BASE}/customers/`, (_req, res, ctx) =>
        res(ctx.status(404, 'Not Found'))
      )
    );

    const res = await getCustomers(1);

    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });
});
