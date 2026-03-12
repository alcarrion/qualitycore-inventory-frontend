// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Iniciar el servidor MSW antes de todos los tests.
// onUnhandledRequest: 'bypass' evita fallos por requests no mockeados
// (p.ej. token/refresh/, token/, etc.) durante tests unitarios existentes.
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
