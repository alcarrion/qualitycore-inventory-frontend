// ============================================================
// constants/messages.js
// Mensajes centralizados de la aplicación
// ============================================================

/**
 * Mensajes de error genéricos
 */
export const ERRORS = {
  // Red y conexión
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu internet.',
  SERVER_ERROR: 'Error del servidor. Intenta de nuevo más tarde.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',

  // Validación general
  REQUIRED_FIELDS: 'Todos los campos son obligatorios.',
  REQUIRED_FIELDS_EXCEPT_ADDRESS: 'Todos los campos son obligatorios excepto dirección.',
  REQUIRED_MARKED_FIELDS: 'Todos los campos marcados son obligatorios.',
  INVALID_FORMAT: 'El formato del dato ingresado no es válido.',
  INVALID_EMAIL: 'Por favor ingresa un correo electrónico válido.',
  INVALID_DATE_RANGE: 'El rango de fechas es inválido (inicio > fin).',
  INVALID_CREDENTIALS: 'Credenciales inválidas.',
  REQUEST_FAILED: 'Error al procesar la solicitud.',
  LOGIN_FAILED: 'No se pudo iniciar sesión.',
  RECOVERY_EMAIL_FAILED: 'No se pudo enviar el correo de recuperación.',

  // Teléfono
  PHONE_LENGTH: 'El teléfono debe tener exactamente 10 dígitos.',

  // Contraseña
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres.',
  PASSWORD_UPPERCASE: 'La contraseña debe contener al menos una letra mayúscula.',
  PASSWORD_LOWERCASE: 'La contraseña debe contener al menos una letra minúscula.',
  PASSWORD_NUMBER: 'La contraseña debe contener al menos un número.',
  PASSWORD_SPECIAL: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>_-+=[]/;~`).',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
  PASSWORD_CHANGE_FAILED: 'Error al cambiar la contraseña.',

  // Imagen
  IMAGE_FORMAT: 'Solo se permiten imágenes JPG o PNG.',
  IMAGE_SIZE: 'El archivo debe ser menor a 2MB.',
  IMAGE_DIMENSIONS: (min, max) => `La imagen debe tener entre ${min}x${min} y ${max}x${max} píxeles.`,
  IMAGE_MIN_DIMENSIONS: (min) => `La imagen debe tener al menos ${min}x${min} píxeles.`,
  IMAGE_MAX_DIMENSIONS: (max) => `La imagen es demasiado grande (máximo ${max}x${max} píxeles).`,
  IMAGE_LOAD_ERROR: 'No se pudo cargar la imagen.',

  // Permisos
  NO_PERMISSION: 'No tienes permisos para realizar esta acción.',
  ONLY_SUPER_ADMIN: 'Solo los Super Administradores pueden realizar esta acción.',

  // CRUD genéricos
  CREATE_FAILED: (entity) => `No se pudo crear ${entity}.`,
  UPDATE_FAILED: (entity) => `No se pudo actualizar ${entity}.`,
  DELETE_FAILED: (entity) => `No se pudo eliminar ${entity}.`,
  LOAD_FAILED: (entity) => `Error al cargar ${entity}.`,

  // Transacciones
  SELECT_SUPPLIER_FIRST: 'Por favor selecciona un proveedor primero.',
  SELECT_CUSTOMER_FIRST: 'Por favor selecciona un cliente primero.',
  SELECT_PRODUCT_AND_QUANTITY: 'Selecciona un producto y la cantidad.',
  PRODUCT_NOT_FOUND: 'Producto no encontrado.',
  EMPTY_CART: 'El carrito está vacío. Agrega al menos un producto.',
  TRANSACTION_FAILED: (type) => `Error al registrar la ${type}.`,

  // Cotizaciones
  SELECT_CUSTOMER: 'Selecciona un cliente.',
  ADD_AT_LEAST_ONE_PRODUCT: 'Agrega al menos un producto.',
  CHECK_QUANTITIES_AND_PRICES: 'Revisa cantidades y precios de los productos.',
  QUOTATION_SAVE_FAILED: 'Error al guardar la cotización.',
  PDF_GENERATION_FAILED: (error) => `Error al generar PDF: ${error || 'Error desconocido'}`,
};

/**
 * Mensajes de éxito
 */
export const SUCCESS = {
  // CRUD genéricos
  CREATED: (entity) => `${entity} creado correctamente.`,
  UPDATED: (entity) => `${entity} actualizado correctamente.`,
  DELETED: (entity) => `${entity} eliminado correctamente.`,

  // Auth
  LOGIN_SUCCESS: 'Sesión iniciada correctamente.',
  PASSWORD_CHANGED: 'Contraseña cambiada con éxito. Debes volver a iniciar sesión.',
  PASSWORD_RESET_SENT: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
  PASSWORD_RESET_SUCCESS: '¡Contraseña cambiada correctamente! Ahora puedes iniciar sesión.',
  RECOVERY_EMAIL_SENT: 'Se ha enviado un correo para recuperar tu contraseña.',

  // Alertas
  ALERT_DISMISSED: '✅ Alerta cerrada correctamente',
  ALERT_DISMISS_FAILED: '❌ No se pudo cerrar la alerta',

  // Transacciones
  TRANSACTION_CREATED: (type, count) => `${type} registrada correctamente. ${count} producto(s) procesado(s).`,

  // Cotizaciones
  QUOTATION_SAVED: 'Cotización guardada correctamente.',
  QUOTATION_SAVED_GENERATING_PDF: 'Cotización guardada. Generando PDF...',
  PDF_GENERATED: 'PDF generado correctamente.',
  REPORT_GENERATED: 'Reporte generado correctamente.',
};

/**
 * Mensajes de confirmación
 */
export const CONFIRM = {
  DELETE: (entity, name) => `¿Estás seguro de que deseas eliminar ${entity} "${name}"? Esta acción no se puede deshacer.`,
  LOGOUT: '¿Estás seguro que quieres cerrar sesión?',
  DISCARD_CHANGES: '¿Estás seguro de que deseas descartar los cambios?',
  CLOSE_WITHOUT_SAVE_TITLE: '¿Cerrar sin guardar?',
  CLOSE_WITHOUT_SAVE: 'Los cambios no guardados se perderán. ¿Estás seguro de que deseas cerrar?',
};

/**
 * Etiquetas de entidades (para usar con mensajes genéricos)
 */
export const ENTITIES = {
  PRODUCT: 'el producto',
  CUSTOMER: 'el cliente',
  SUPPLIER: 'el proveedor',
  USER: 'el usuario',
  CATEGORY: 'la categoría',
  SALE: 'la venta',
  PURCHASE: 'la compra',
  MOVEMENT: 'el movimiento',
};
