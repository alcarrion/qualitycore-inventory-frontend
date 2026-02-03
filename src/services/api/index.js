// ============================================================
// services/api/index.js
// Punto de entrada centralizado - Re-exporta todas las funciones
// para mantener compatibilidad con imports existentes
// ============================================================

// Configuración y utilidades
export {
  API_URL,
  API_ROOT,
  initCsrf,
  apiFetch,
  apiFetchForm,
  getCookie,
} from "./config";

// Autenticación
export {
  loginUser,
  forgotPassword,
  changePassword,
  postResetPassword,
} from "./auth";

// Dashboard
export { getDashboardSummary } from "./dashboard";

// Movimientos
export { getMovements, postMovement } from "./movements";

// Ventas
export { getSales, postSale, getSale } from "./sales";

// Compras
export { getPurchases, postPurchase, getPurchase } from "./purchases";

// Productos
export {
  getProducts,
  postProduct,
  patchProduct,
  patchProductJson,
} from "./products";

// Categorías
export { getCategories, postCategory } from "./categories";

// Clientes
export { getCustomers, postCustomer, patchCustomer } from "./customers";

// Proveedores
export { getSuppliers, postSupplier, patchSupplier } from "./suppliers";

// Usuarios
export { getUsers, postUser, patchUser } from "./users";

// Cotizaciones
export {
  postQuotation,
  getQuotationPDF,
  checkPDFStatus,
} from "./quotations";

// Reportes
export { getReports, postReport, generateReport } from "./reports";

// Alertas
export { getAlerts, dismissAlert } from "./alerts";
