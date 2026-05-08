import { useState, useEffect } from 'react'
import api from '../lib/api'
import type { Product } from '../types'

export function useCategories(products: Product[]) {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    // Try fetching from dedicated endpoint first
    api.get<{ success: boolean; data: Array<{ name: string } | string> }>('/v1/products/categories')
      .then((res) => {
        const cats = res.data.data.map((c) =>
          typeof c === 'string' ? c : c.name,
        )
        setCategories(cats)
      })
      .catch(() => {
        // Fallback: derive unique categories from the products already loaded
        const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort()
        setCategories(unique)
      })
  }, [products])

  return categories
}
