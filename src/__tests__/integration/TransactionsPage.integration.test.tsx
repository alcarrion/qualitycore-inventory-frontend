// src/__tests__/integration/TransactionsPage.integration.test.tsx
// Tests de integración de componente: renderiza TransactionsPage con MSW
// interceptando las llamadas a sales/purchases/movements y verifica la pantalla.
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from '../../contexts/AppContext';
import TransactionsPage from '../../pages/TransactionsPage';
import type { User } from '../../types/models';
import type { LayoutContext } from '../../types/context';

// ── Wrapper con outlet context (simula el Layout padre) ──────────────────────

const mockUser: User = {
  id: 1,
  name: 'Test Admin',
  email: 'admin@test.com',
  role: 'SuperAdmin',
};

function TestLayout() {
  const ctx: LayoutContext = { user: mockUser };
  return <Outlet context={ctx} />;
}

function renderTransactionsPage() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<TestLayout />}>
            <Route path="/" element={<TransactionsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProvider>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('TransactionsPage — integración componente', () => {
  test('muestra el título Gestión de Movimientos', async () => {
    renderTransactionsPage();

    await waitFor(() => {
      expect(screen.getByText('Gestión de Movimientos')).toBeInTheDocument();
    });
    expect(screen.getByText(/Control de entradas y salidas/i)).toBeInTheDocument();
  });

  test('muestra las ventas recibidas desde la API', async () => {
    renderTransactionsPage();

    // La sección de ventas debe aparecer con los datos del mock
    await waitFor(() => {
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });
    expect(screen.getByText('Juan López')).toBeInTheDocument();
  });

  test('muestra las compras recibidas desde la API', async () => {
    renderTransactionsPage();

    // La sección de compras debe aparecer con el proveedor del mock
    await waitFor(() => {
      expect(screen.getByText('Proveedor Test')).toBeInTheDocument();
    });
  });

  test('muestra estado vacío en ventas cuando la API devuelve 0 resultados', async () => {
    const { server } = await import('../../mocks/server');
    const { rest } = await import('msw');

    server.use(
      rest.get('http://localhost:8000/api/sales/', (_req, res, ctx) =>
        res(ctx.json({ count: 0, results: [], next: null, previous: null }))
      )
    );

    renderTransactionsPage();

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron ventas/i)).toBeInTheDocument();
    });
  });

  test('muestra los encabezados de secciones de entradas y salidas', async () => {
    renderTransactionsPage();

    await waitFor(() => {
      expect(screen.getByText('Salidas (Ventas)')).toBeInTheDocument();
    });
    expect(screen.getByText('Entradas (Compras)')).toBeInTheDocument();
  });
});
