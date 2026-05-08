// ─── API Response wrapper ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: Pagination
}

// ─── Partner / Auth ──────────────────────────────────────────────────────────

export type Tier = 'Gold' | 'Silver' | 'Bronze'

export interface Partner {
  id: string
  name: string
  tier: Tier
  discount_pct: number
}

export interface AuthState {
  token: string | null
  partner: Partner | null
  isReady: boolean
  error: string | null
  initialize: () => Promise<void>
  refresh: () => Promise<void>
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductTranslations {
  en?: string
  ko?: string
  id?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  selling_price: number
  compare_at_price?: number | null
  your_price: number
  stock_qty: number
  is_halal: boolean
  images?: string[] | null
  description?: string
  translations?: ProductTranslations | null
}

export interface CategoryTranslations {
  en?: string
  ko?: string
  id?: string
}

export interface Category {
  name: string                        // canonical key — use for API ?category= filter
  translations: CategoryTranslations  // display labels per language
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  grandTotal: number
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  postal_code: string
  country: string
}

export interface OrderItem {
  id: string
  product_id: string
  name: string            // API field (also stored as product_name in some responses)
  product_name?: string   // fallback alias
  sku: string
  quantity: number
  unit_price: number
  compare_at_price?: number | null  // retail/MSRP — fetched separately from /v1/products/:id
  discount_pct?: number             // partner tier margin — internal only
  final_price?: number              // partner cost — internal only
  line_total: number
}

export interface Order {
  id: string
  order_no: string
  status: OrderStatus
  partner_id: string
  partner_name?: string
  tier?: Tier
  discount_pct?: number
  items: OrderItem[]
  subtotal?: number
  discount_amount?: number
  delivery_fee?: number
  total_amount: number
  shipping_addr?: ShippingAddress
  notes?: string
  created_at: string
  updated_at: string
}

// ─── Kakao Postcode API ───────────────────────────────────────────────────────

export interface DaumPostcodeData {
  zonecode: string
  address: string
  addressEnglish: string
  addressType: 'R' | 'J'
  roadAddress: string
  roadAddressEnglish: string
  jibunAddress: string
  sido: string
  sidoEnglish: string
  sigungu: string
  sigunguEnglish: string
  bname: string
  buildingName: string
  apartment: 'Y' | 'N'
  query: string
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
        width?: number
        height?: number
      }) => {
        open: () => void
        embed: (element: HTMLElement) => void
      }
    }
  }
}
