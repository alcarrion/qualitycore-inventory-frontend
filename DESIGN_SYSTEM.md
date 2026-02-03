# Quality Core Inventory - Design System Documentation

## Tabla de Contenido
1. [Introducción](#introducción)
2. [Tokens de Diseño](#tokens-de-diseño)
3. [Colores](#colores)
4. [Tipografía](#tipografía)
5. [Espaciado](#espaciado)
6. [Componentes](#componentes)
7. [Breakpoints Responsivos](#breakpoints-responsivos)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

Este sistema de diseño proporciona una base sólida y escalable para el desarrollo de la interfaz de usuario de Quality Core Inventory. Utiliza CSS Custom Properties (variables CSS) para mantener consistencia y facilitar el mantenimiento.

### Archivos Principales
- `src/index.css` - Tokens de diseño base y estilos globales
- `src/styles/globals.css` - Clases de utilidad y componentes reutilizables
- Archivos de componentes individuales en `src/styles/components/`
- Archivos de páginas individuales en `src/styles/pages/`

---

## Tokens de Diseño

### Spacing Scale (Escala de Espaciado)
Sistema de espaciado basado en múltiplos de 4px para consistencia visual.

```css
--space-xs: 0.25rem;    /* 4px */
--space-sm: 0.5rem;     /* 8px */
--space-md: 1rem;       /* 16px */
--space-lg: 1.5rem;     /* 24px */
--space-xl: 2rem;       /* 32px */
--space-2xl: 3rem;      /* 48px */
--space-3xl: 4rem;      /* 64px */
```

**Uso:**
```css
.card {
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  gap: var(--space-sm);
}
```

### Border Radius
```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-full: 9999px;   /* Circular */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Z-Index Scale
```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

---

## Colores

### Colores de Marca
```css
--color-brand-primary: #41d1a7;
--color-brand-primary-hover: #1bbbad;
--color-brand-secondary: #7f85f5;
--color-brand-accent: #68e470;
```

### Backgrounds
```css
--bg-primary: #ffffff (light) / #1a1d2e (dark);
--bg-secondary: #f7fafd (light) / #252836 (dark);
--bg-tertiary: #e6eeff (light) / #2d3142 (dark);
--bg-elevated: #ffffff (light) / #2d3142 (dark);
--bg-overlay: rgba(0, 0, 0, 0.5) (light) / rgba(0, 0, 0, 0.7) (dark);
```

### Texto
```css
--text-primary: #262a36 (light) / #e4e6eb (dark);
--text-secondary: #6c7a90 (light) / #a0a3bd (dark);
--text-tertiary: #9ca3af (light) / #6b7280 (dark);
--text-inverse: #ffffff (light) / #1a1d2e (dark);
--text-link: #41d1a7;
--text-link-hover: #1bbbad;
```

### Colores Semánticos
```css
/* Success - Verde */
--color-success: #10b981;
--color-success-bg: #d1fae5 (light) / #064e3b (dark);
--color-success-text: #065f46 (light) / #6ee7b7 (dark);

/* Warning - Amarillo */
--color-warning: #f59e0b;
--color-warning-bg: #fef3c7 (light) / #78350f (dark);
--color-warning-text: #92400e (light) / #fcd34d (dark);

/* Error - Rojo */
--color-error: #ef4444;
--color-error-bg: #fee2e2 (light) / #7f1d1d (dark);
--color-error-text: #991b1b (light) / #fca5a5 (dark);

/* Info - Azul */
--color-info: #3b82f6;
--color-info-bg: #dbeafe (light) / #1e3a8a (dark);
--color-info-text: #1e40af (light) / #93c5fd (dark);
```

### Borders
```css
--border-primary: #e2e8f0 (light) / #3d4152 (dark);
--border-secondary: #cbd5e1 (light) / #4b5563 (dark);
--border-focus: #41d1a7;
--border-error: #ef4444;
```

---

## Tipografía

### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Uso de Headings
```html
<h1>Título Principal</h1>      <!-- 36px, font-weight: 700 -->
<h2>Sección Principal</h2>     <!-- 30px, font-weight: 700 -->
<h3>Subsección</h3>            <!-- 24px, font-weight: 700 -->
<h4>Subtítulo</h4>             <!-- 20px, font-weight: 700 -->
```

---

## Espaciado

### Margins
```css
.mt-0 { margin-top: 0; }
.mt-1 { margin-top: var(--space-xs); }  /* 4px */
.mt-2 { margin-top: var(--space-sm); }  /* 8px */
.mt-3 { margin-top: var(--space-md); }  /* 16px */
.mt-4 { margin-top: var(--space-lg); }  /* 24px */
.mt-5 { margin-top: var(--space-xl); }  /* 32px */

/* También disponible: mb-, ml-, mr-, mx-, my- */
```

### Padding
```css
.p-0 { padding: 0; }
.p-1 { padding: var(--space-xs); }  /* 4px */
.p-2 { padding: var(--space-sm); }  /* 8px */
.p-3 { padding: var(--space-md); }  /* 16px */
.p-4 { padding: var(--space-lg); }  /* 24px */
.p-5 { padding: var(--space-xl); }  /* 32px */
```

### Gap (Flexbox/Grid)
```css
.gap-1 { gap: var(--space-xs); }  /* 4px */
.gap-2 { gap: var(--space-sm); }  /* 8px */
.gap-3 { gap: var(--space-md); }  /* 16px */
.gap-4 { gap: var(--space-lg); }  /* 24px */
.gap-5 { gap: var(--space-xl); }  /* 32px */
```

---

## Componentes

### Botones

#### Variantes
```html
<!-- Primary Button -->
<button class="btn btn-primary">Guardar</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Cancelar</button>

<!-- Danger Button -->
<button class="btn btn-danger">Eliminar</button>

<!-- Success Button -->
<button class="btn btn-success">Confirmar</button>

<!-- Ghost Button -->
<button class="btn btn-ghost">Ver más</button>
```

#### Tamaños
```html
<!-- Small -->
<button class="btn btn-primary btn--sm">Pequeño</button>

<!-- Default -->
<button class="btn btn-primary">Normal</button>

<!-- Large -->
<button class="btn btn-primary btn--lg">Grande</button>

<!-- Block (Full Width) -->
<button class="btn btn-primary btn--block">Ancho Completo</button>
```

### Cards
```html
<!-- Default Card -->
<div class="content-card">
  <h3>Título de la Tarjeta</h3>
  <p>Contenido...</p>
</div>

<!-- Compact Card -->
<div class="content-card content-card--compact">
  Contenido más compacto
</div>

<!-- Spacious Card -->
<div class="content-card content-card--spacious">
  Contenido con más espacio
</div>
```

### Badges
```html
<span class="badge badge-success">Activo</span>
<span class="badge badge-warning">Pendiente</span>
<span class="badge badge-danger">Inactivo</span>
<span class="badge badge-info">Información</span>
<span class="badge badge-neutral">Neutral</span>
```

### Forms
```html
<div class="form-group">
  <label class="form-label form-label--required">Nombre</label>
  <input type="text" placeholder="Ingrese su nombre" />
  <span class="form-helper-text">Texto de ayuda</span>
</div>

<!-- Con error -->
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="input-error" />
  <span class="form-error-message">Email inválido</span>
</div>
```

### Alerts
```html
<div class="alert alert-success">Operación exitosa</div>
<div class="alert alert-warning">Advertencia importante</div>
<div class="alert alert-error">Error en la operación</div>
<div class="alert alert-info">Información útil</div>
```

### Tables
```html
<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th>Columna 1</th>
        <th>Columna 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Dato 1</td>
        <td>Dato 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Spinners / Loading
```html
<!-- Default Spinner -->
<div class="spinner"></div>

<!-- Large Spinner -->
<div class="spinner spinner--lg"></div>

<!-- Loading Overlay -->
<div class="loading-overlay">
  <div class="spinner spinner--lg"></div>
</div>
```

---

## Breakpoints Responsivos

### Breakpoints Definidos
```css
--breakpoint-sm: 640px;   /* Móviles grandes */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Pantallas grandes */
```

### Media Queries (Mobile First)
```css
/* Mobile First - Estilos base para móvil */
.elemento {
  padding: var(--space-sm);
}

/* Tablet y superior */
@media (min-width: 640px) {
  .elemento {
    padding: var(--space-md);
  }
}

/* Desktop y superior */
@media (min-width: 1024px) {
  .elemento {
    padding: var(--space-lg);
  }
}
```

### Clases de Utilidad Responsivas
```html
<!-- Ocultar en móvil -->
<div class="hide-mobile">Solo en tablet y desktop</div>

<!-- Ocultar en tablet -->
<div class="hide-tablet">Solo en móvil y desktop</div>

<!-- Ocultar en desktop -->
<div class="hide-desktop">Solo en móvil y tablet</div>

<!-- Mostrar solo en móvil -->
<div class="show-mobile">Solo en móvil</div>

<!-- Mostrar solo en tablet -->
<div class="show-tablet">Solo en tablet</div>

<!-- Mostrar solo en desktop -->
<div class="show-desktop">Solo en desktop</div>
```

---

## Mejores Prácticas

### 1. Usa Variables CSS
❌ **Evitar:**
```css
.button {
  padding: 12px 24px;
  border-radius: 8px;
  color: #41d1a7;
}
```

✅ **Correcto:**
```css
.button {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  color: var(--color-brand-primary);
}
```

### 2. Mobile First
❌ **Evitar:**
```css
.element {
  font-size: 24px;
}

@media (max-width: 768px) {
  .element {
    font-size: 16px;
  }
}
```

✅ **Correcto:**
```css
.element {
  font-size: var(--font-size-base);
}

@media (min-width: 768px) {
  .element {
    font-size: var(--font-size-2xl);
  }
}
```

### 3. Usa Clases de Utilidad para Espaciado
❌ **Evitar:**
```css
.custom-margin {
  margin-bottom: 16px;
}
```

✅ **Correcto:**
```html
<div class="mb-3">Contenido</div>
```

### 4. Mantén la Consistencia
- Usa siempre los tokens definidos
- No crees nuevos valores de color/espaciado sin actualizar el sistema
- Documenta cualquier excepción o caso especial

### 5. Accesibilidad
- Usa siempre las clases de focus visible
- Respeta `prefers-reduced-motion`
- Mantén contraste suficiente (mínimo 4.5:1 para texto normal)
- Usa etiquetas semánticas HTML

### 6. Performance
- Usa `transition` en lugar de `animation` cuando sea posible
- Evita transiciones en `width`, `height` - usa `transform` en su lugar
- Minimiza el uso de `box-shadow` en elementos con muchas instancias

---

## Contribuir al Sistema de Diseño

### Agregar Nuevos Tokens
1. Actualiza `src/index.css` con el nuevo token
2. Documenta el token en este archivo
3. Crea ejemplos de uso
4. Actualiza componentes existentes si aplica

### Agregar Nuevos Componentes
1. Crea el archivo CSS en `src/styles/components/`
2. Usa tokens existentes
3. Incluye variantes responsivas
4. Documenta el componente en esta guía
5. Crea ejemplos de uso

---

## Recursos

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Mobile-First Design](https://www.browserstack.com/guide/how-to-implement-mobile-first-design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS (inspiración para tokens)](https://tailwindcss.com/docs)

---

**Última actualización:** Diciembre 2025
**Versión del Sistema:** 1.0.0
