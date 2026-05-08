import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../lib/api'
import type { Product, PaginatedResponse } from '../types'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<Product>>(
        '/v1/products',
        { params: { page: 1, limit: 100 } },
      )
      setProducts(res.data.data)
      setLastSynced(new Date())
      setError(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Failed to fetch products'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    intervalRef.current = setInterval(fetchProducts, REFRESH_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchProducts])

  return { products, loading, error, lastSynced, refetch: fetchProducts }
}
