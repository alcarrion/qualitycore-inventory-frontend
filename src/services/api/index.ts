// ============================================================
// services/api/index.ts
// Punto de entrada centralizado - Re-exporta todas las funciones
// ============================================================

export {
  API_URL,
  API_ROOT,
  initCsrf,
  apiFetch,
  apiFetchForm,
} from "./config";

export {
  loginUser,
  logoutUser,
  forgotPassword,
  changePassword,
  postResetPassword,
} from "./auth";

export { getDashboardSummary } from "./dashboard";

export { getMovements, postMovement, postAdjustment, postCorrection } from "./movements";

export { getSales, postSale, getSale } from "./sales";

export { getPurchases, postPurchase, getPurchase } from "./purchases";

export {
  getProducts,
  postProduct,
  patchProduct,
  patchProductJson,
  checkStock,
} from "./products";

export { getCategories, postCategory, patchCategory } from "./categories";

export { getCustomers, postCustomer, patchCustomer } from "./customers";

export { getSuppliers, postSupplier, patchSupplier } from "./suppliers";

export { getMe, getUsers, postUser, patchUser } from "./users";

export {
  postQuotation,
  getQuotationPDF,
  checkPDFStatus,
} from "./quotations";

export { getReports, postReport, generateReport, checkReportStatus } from "./reports";

export { getAlerts, dismissAlert } from "./alerts";

export { getAppConfig } from "./appConfig";
