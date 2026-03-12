// src/__tests__/integration/getMe.api.test.ts
// Tests de integración para el endpoint GET /users/me/.
// Verifica validación de sesión: datos frescos del servidor en 200, fallo en 401.
import { server } from '../../mocks/server';
import { rest } from 'msw';
import { getMe } from '../../services/api';
import type { User } from '../../types/models';

const BASE = 'http://localhost:8000/api';

describe('getMe — integración API', () => {
  test('devuelve el usuario actual en respuesta exitosa', async () => {
    const res = await getMe();

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    const user = res.data as User;
    expect(user.email).toBe('test@test.com');
    expect(user.role).toBe('admin');
  });

  test('devuelve ok=false con status 401 cuando la sesión expiró', async () => {
    // Sobreescribir el handler para simular sesión expirada.
    // apiFetch intentará token refresh (también mockeado a 401 en handlers.ts)
    // y finalmente retornará { ok: false, status: 401 }.
    server.use(
      rest.get(`${BASE}/users/me/`, (_req, res, ctx) =>
        res(ctx.status(401))
      )
    );

    const res = await getMe();

    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
  });
});
