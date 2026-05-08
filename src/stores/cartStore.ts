import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartState, CartItem, Product } from '../types'
import { DELIVERY_FEE } from '../lib/constants'

function computeTotals(items: CartItem[]) {
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.product.selling_price * i.quantity, 0)
  return { totalItems, subtotal, grandTotal: subtotal + DELIVERY_FEE }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      grandTotal: DELIVERY_FEE,

      addItem: (product: Product, quantity = 1) => {
        const items = get().items
        const existing = items.find((i) => i.product.id === product.id)
        const newItems = existing
          ? items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            )
          : [...items, { product, quantity }]
        set({ items: newItems, ...computeTotals(newItems) })
      },

      removeItem: (productId: string) => {
        const newItems = get().items.filter((i) => i.product.id !== productId)
        set({ items: newItems, ...computeTotals(newItems) })
      },

      updateQty: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const newItems = get().items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i,
        )
        set({ items: newItems, ...computeTotals(newItems) })
      },

      clearCart: () => set({ items: [], totalItems: 0, subtotal: 0, grandTotal: DELIVERY_FEE }),
    }),
    {
      name: 'halal-cart',
      storage: createJSONStorage(() => sessionStorage),
      // Rehydrate computed totals after loading from sessionStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = computeTotals(state.items)
          state.totalItems = totals.totalItems
          state.subtotal = totals.subtotal
          state.grandTotal = totals.grandTotal
        }
      },
    },
  ),
)

