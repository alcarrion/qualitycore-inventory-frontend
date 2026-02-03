// ============================================================
// services/api.js
// Punto de entrada de compatibilidad - Re-exporta desde api/
// ============================================================
//
// NOTA: Este archivo mantiene compatibilidad con imports existentes.
// El código real está organizado en services/api/ por dominio:
//
// services/api/
// ├── config.js      - Configuración base, CSRF, fetch helpers
// ├── auth.js        - login, forgotPassword, changePassword
// ├── dashboard.js   - getDashboardSummary
// ├── movements.js   - getMovements, postMovement
// ├── sales.js       - getSales, postSale, getSale
// ├── purchases.js   - getPurchases, postPurchase, getPurchase
// ├── products.js    - getProducts, postProduct, patchProduct
// ├── categories.js  - getCategories, postCategory
// ├── customers.js   - getCustomers, postCustomer, patchCustomer
// ├── suppliers.js   - getSuppliers, postSupplier, patchSupplier
// ├── users.js       - getUsers, postUser, patchUser
// ├── quotations.js  - postQuotation, getQuotationPDF, checkPDFStatus
// ├── reports.js     - getReports, postReport, generateReport
// ├── alerts.js      - getAlerts, dismissAlert
// └── index.js       - Re-exporta todo
//
// ============================================================

export * from "./api/index";
