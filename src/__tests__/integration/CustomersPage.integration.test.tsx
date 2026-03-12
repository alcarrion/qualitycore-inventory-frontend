// src/__tests__/integration/CustomersPage.integration.test.tsx
// Tests de integración de componente: renderiza CustomersPage con MSW
// interceptando getCustomers() y verifica la pantalla.
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from '../../contexts/AppContext';
import CustomersPage from '../../pages/CustomersPage';
import type { User } from '../../types/models';
import type { LayoutContext } from '../../types/context';

// ── Wrapper con outlet context (simula el Layout padre) ──────────────────────

const mockUser: User = {
  id: 1,
  name: 'Test Admin',
  email: 'admin@test.com',
  role: 'Administrator',
};

function TestLayout() {
  const ctx: LayoutContext = { user: mockUser };
  return <Outlet context={ctx} />;
}

function renderCustomersPage() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<TestLayout />}>
            <Route path="/" element={<CustomersPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProvider>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('CustomersPage — integración componente', () => {
  test('muestra la lista de clientes recibida desde la API', async () => {
    renderCustomersPage();

    // Esperar a que los clientes del mock aparezcan en pantalla
    await waitFor(() => {
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });
    expect(screen.getByText('Juan López')).toBeInTheDocument();
  });

  test('muestra estado vacío cuando la API devuelve 0 resultados', async () => {
    const { server } = await import('../../mocks/server');
    const { rest } = await import('msw');

    server.use(
      rest.get('http://localhost:8000/api/customers/', (_req, res, ctx) =>
        res(ctx.json({ count: 0, results: [], next: null, previous: null }))
      )
    );

    renderCustomersPage();

    await waitFor(() => {
      expect(screen.getByText(/No hay clientes/i)).toBeInTheDocument();
    });
  });

  test('filtra clientes al escribir en el buscador', async () => {
    renderCustomersPage();

    // Esperar primer render con datos
    await waitFor(() => {
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });

    // Escribir en el buscador — el handler devuelve solo Ana cuando search='Ana'
    const searchInput = screen.getByPlaceholderText(/Buscar clientes/i);
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'Ana');

    // Debounce de 300ms + actualización de lista
    await waitFor(
      () => {
        expect(screen.getByText('Ana García')).toBeInTheDocument();
        expect(screen.queryByText('Juan López')).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });
});
