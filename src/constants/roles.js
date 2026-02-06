// ============================================================
// constants/roles.js
// Constantes y utilidades para manejo de roles
// ============================================================

/**
 * Roles del sistema (valores exactos del backend)
 */
export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMINISTRATOR: 'Administrator',
  USER: 'User',
};

/**
 * Variantes de roles (para compatibilidad con datos existentes)
 * Incluye versiones en español y lowercase
 */
const ROLE_VARIANTS = {
  [ROLES.SUPER_ADMIN]: ['superadmin', 'super administrador', 'SuperAdmin'],
  [ROLES.ADMINISTRATOR]: ['administrator', 'Administrator', 'admin'],
  [ROLES.USER]: ['user', 'User', 'usuario'],
};

/**
 * Normaliza un rol a su valor canónico
 * @param {string} role - El rol a normalizar
 * @returns {string|null} - El rol normalizado o null si no es válido
 */
export function normalizeRole(role) {
  if (!role) return null;
  const lowerRole = role.toLowerCase();

  for (const [canonical, variants] of Object.entries(ROLE_VARIANTS)) {
    if (variants.some(v => v.toLowerCase() === lowerRole)) {
      return canonical;
    }
  }
  return null;
}

/**
 * Verifica si un rol es SuperAdmin
 */
export function isSuperAdmin(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.SUPER_ADMIN;
}

/**
 * Verifica si un rol es Administrator o superior
 */
export function isAdmin(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMINISTRATOR;
}

/**
 * Verifica si un rol tiene permisos de usuario básico o superior
 */
export function isUser(role) {
  const normalized = normalizeRole(role);
  return normalized !== null;
}

/**
 * Permisos por funcionalidad
 */
export const PERMISSIONS = {
  // Productos
  CAN_ADD_PRODUCT: (role) => isAdmin(role),
  CAN_EDIT_PRODUCT: (role) => isAdmin(role),
  CAN_DELETE_PRODUCT: (role) => isSuperAdmin(role),

  // Clientes
  CAN_ADD_CUSTOMER: (role) => isUser(role),
  CAN_EDIT_CUSTOMER: (role) => isUser(role),
  CAN_DELETE_CUSTOMER: (role) => isSuperAdmin(role),

  // Proveedores
  CAN_ADD_SUPPLIER: (role) => isAdmin(role),
  CAN_EDIT_SUPPLIER: (role) => isAdmin(role),
  CAN_DELETE_SUPPLIER: (role) => isSuperAdmin(role),

  // Usuarios
  CAN_VIEW_USERS: (role) => isAdmin(role),
  CAN_ADD_USER: (role) => isSuperAdmin(role),
  CAN_EDIT_USER: (role) => isAdmin(role),
  CAN_DELETE_USER: (role) => isSuperAdmin(role),

  // Transacciones
  CAN_CREATE_MOVEMENT: (role) => isUser(role),
};
