export type DocumentType = 'cedula' | 'ruc' | 'passport';
export type MovementType = 'input' | 'output' | 'adjustment' | 'correction';
export type UserRole = 'SuperAdmin' | 'Administrator' | 'User';

/** Referencia a una entidad: puede ser su ID (número) o el objeto completo. */
export type Ref<T> = number | T;
/** Referencia opcional que también puede ser null. */
export type NullableRef<T> = Ref<T> | null;

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  current_stock: number;
  stock?: number;
  minimum_stock?: number;
  supplier: Ref<Supplier>;
  supplier_name?: string;
  category?: NullableRef<Category>;
  category_name?: string | null;
  description?: string;
  status?: string | null;
  is_active?: boolean;
  image?: string | null;
  image_url?: string | null;
  deleted_at: string | null;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  document_type: DocumentType;
  document?: string;
  document_number?: string;
  deleted_at: string | null;
}

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  document_type: DocumentType;
  tax_id?: string;
  document_number?: string;
  deleted_at: string | null;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  is_active?: boolean;
}

export interface SaleItem {
  product: Ref<Product>;
  quantity: number;
  price?: number;
}

export interface InvoiceMovement {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  corrected_by_id?: number | null;
  correction_quantity?: number;
  original_quantity?: number | null;
}

export interface InvoiceMovementsData {
  items: InvoiceMovement[];
  truncated: boolean;
  total: number;
}

export interface Sale {
  id: number;
  customer: Ref<Customer>;
  customer_name: string;
  date: string;
  total: number;
  user_name: string;
  items: SaleItem[];
  movements?: InvoiceMovementsData;
  created_at?: string;
}

export interface PurchaseItem {
  product: Ref<Product>;
  quantity: number;
  price?: number;
}

export interface Purchase {
  id: number;
  supplier: Ref<Supplier>;
  supplier_name: string;
  date: string;
  total: number;
  user_name: string;
  items: PurchaseItem[];
  movements?: InvoiceMovementsData;
  created_at?: string;
}

export interface Movement {
  id: number;
  product: Ref<Product>;
  product_name?: string;
  quantity: number;
  movement_type: MovementType;
  reason?: string;
  date: string;
  deleted_at: string | null;
  sale?: number | null;
  purchase?: number | null;
  user_name?: string;
  original_quantity?: number | null;
  correction_quantity?: number;
  corrected_by_id?: number | null;
  price?: number;
}

export interface Alert {
  id: number;
  product_id: number;
  product_name: string;
  current_stock: number;
  threshold: number;
  type?: string;
  message?: string;
}

export interface DashboardSummary {
  total_products: number;
  total_customers: number;
  total_movements: number;
  total_entries: number;
  total_exits: number;
  low_stock_alerts: number;
  total_sales: number;
}

export interface AppConfigTaxRate {
  iva: number;
}

export interface AppConfigPagination {
  default_page_size: number;
  page_size_options: number[];
}

export interface AppConfigValidation {
  phone_length: number;
  password_min_length: number;
}

export interface AppConfigTimeouts {
  toast_default: number;
  toast_short: number;
  toast_long: number;
  message_display: number;
  redirect_delay: number;
  polling_interval: number;
  clock_interval: number;
}

export interface AppConfigImage {
  max_size_mb: number;
  max_size_bytes: number;
  allowed_types: string[];
}

export interface AppConfigLimits {
  max_product_price: number;
  max_quantity: number;
}

export interface AppConfig {
  tax_rate: AppConfigTaxRate;
  pagination: AppConfigPagination;
  validation: AppConfigValidation;
  timeouts: AppConfigTimeouts;
  image: AppConfigImage;
  limits: AppConfigLimits;
}
