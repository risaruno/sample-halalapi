import { useState, useCallback } from 'react'
import { useEffect } from 'react'
import api from '../lib/api'
import type { Order, PaginatedResponse } from '../types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Order>>(
        '/v1/orders',
        { params: { limit: 100 } },
      )
      setOrders(res.data.data)
      setError(null)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        'Failed to fetch orders'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}
