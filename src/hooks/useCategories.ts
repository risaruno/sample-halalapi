import { useState, useEffect } from 'react'
import api from '../lib/api'
import type { Product, Category } from '../types'

type RawCategory =
  | string
  | { name: string; translations?: { en?: string; ko?: string; id?: string } }

function normalise(raw: RawCategory): Category {
  if (typeof raw === 'string') {
    return { name: raw, translations: { en: raw } }
  }
  return { name: raw.name, translations: raw.translations ?? { en: raw.name } }
}

export function useCategories(products: Product[]) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api.get<{ success: boolean; data: RawCategory[] }>('/v1/products/categories')
      .then((res) => {
        setCategories(res.data.data.map(normalise))
      })
      .catch(() => {
        // Fallback: derive from loaded products (canonical name only, no translations)
        const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort()
        setCategories(unique.map((name) => ({ name, translations: { en: name } })))
      })
  }, [products])

  return categories
}
