// src/mocks/server.ts
// Servidor MSW para el entorno Node/Jest (no browser).
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
