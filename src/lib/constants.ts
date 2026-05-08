export const DELIVERY_FEE = 4000

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://halalapi-api.vercel.app'

export const ROUTES = {
  PRODUCTS: '/products',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
} as const

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`
}
