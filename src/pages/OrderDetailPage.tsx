import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { Order, Product } from '../types'
import { formatKRW, DELIVERY_FEE } from '../lib/constants'
import OrderStatusBadge from '../components/orders/OrderStatusBadge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 -mt-1">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-5">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>
            닫기
          </Button>
          <Button variant="danger" size="md" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [compareAtMap, setCompareAtMap] = useState<Record<string, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await api.get<{ success: boolean; data: Order }>(`/v1/orders/${id}`)
      const fetchedOrder = res.data.data
      setOrder(fetchedOrder)
      setError(null)

      // Fetch compare_at_price for each unique product in the order
      const productIds = [...new Set(fetchedOrder.items.map((i) => i.product_id))]
      const results = await Promise.allSettled(
        productIds.map((pid) =>
          api.get<{ success: boolean; data: Product }>(`/v1/products/${pid}`)
        )
      )
      const map: Record<string, number | null> = {}
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          map[productIds[idx]] = result.value.data.data.compare_at_price ?? null
        }
      })
      setCompareAtMap(map)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        '주문 정보를 불러올 수 없습니다.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const handleCancel = async () => {
    if (!id) return
    setShowCancelModal(false)
    setActionLoading(true)
    try {
      await api.patch(`/v1/orders/${id}/cancel`)
      toast.success('주문이 취소되었습니다.')
      await fetchOrder()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        '주문 취소 처리 중 오류가 발생했습니다.'
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <LoadingSpinner centered />

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-semibold mb-1">오류</p>
          <p className="text-sm">{error ?? '주문을 찾을 수 없습니다.'}</p>
          <button className="mt-3 text-sm underline" onClick={() => navigate('/orders')}>
            주문 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const customerSubtotal = order.items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const deliveryFee = order.delivery_fee ?? DELIVERY_FEE
  const totalRetailSavings = order.items.reduce((s, i) => {
    const cap = compareAtMap[i.product_id]
    if (cap != null && cap > i.unit_price) {
      return s + (cap - i.unit_price) * i.quantity
    }
    return s
  }, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
              #{order.order_no}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(order.created_at), 'yyyy년 MM월 dd일 HH:mm')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4">주문 상품</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[500px] px-4 sm:px-0">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="pb-2 pr-3 font-medium pl-4 sm:pl-0">상품</th>
                  <th className="pb-2 pr-3 font-medium text-center">수량</th>
                  <th className="pb-2 pr-3 font-medium text-right">정가</th>
                  <th className="pb-2 pr-3 font-medium text-right">판매가</th>
                  <th className="pb-2 font-medium text-right pr-4 sm:pr-0">소계</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => {
                  const cap = compareAtMap[item.product_id]
                  const hasRetailDiscount = cap != null && cap > item.unit_price
                  const savingsPct = hasRetailDiscount
                    ? Math.round((1 - item.unit_price / cap!) * 100)
                    : 0
                  return (
                    <tr key={item.id}>
                      <td className="py-3 pr-3 pl-4 sm:pl-0">
                        <p className="font-medium text-gray-900 leading-tight">
                          {item.name ?? item.product_name}
                        </p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </td>
                      <td className="py-3 pr-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-3 pr-3 text-right">
                        {hasRetailDiscount ? (
                          <>
                            <p className="text-gray-400 line-through">{formatKRW(cap!)}</p>
                            <p className="text-xs text-rose-500 font-medium">-{savingsPct}%</p>
                          </>
                        ) : (
                          <p className="text-gray-400">—</p>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right text-gray-700 font-medium">
                        {formatKRW(item.unit_price)}
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-900 pr-4 sm:pr-0">
                        {formatKRW(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Order totals */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-display font-semibold text-gray-900 mb-3">결제 요약</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>소계</span>
                <span>{formatKRW(customerSubtotal)}</span>
              </div>
              {totalRetailSavings > 0 && (
                <div className="flex justify-between text-rose-500 font-medium">
                  <span>절약 (Savings vs Retail)</span>
                  <span>-{formatKRW(totalRetailSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span>{formatKRW(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-base">
                <span>합계</span>
                <span className="text-teal-700">{formatKRW(customerSubtotal + deliveryFee)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_addr && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-display font-semibold text-gray-900 mb-2">배송 주소</h2>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{order.shipping_addr.line1}</p>
                {order.shipping_addr.line2 && <p>{order.shipping_addr.line2}</p>}
                <p>{order.shipping_addr.city} {order.shipping_addr.postal_code}</p>
                <p>{order.shipping_addr.country}</p>
              </div>
            </div>
          )}

          {/* Action: cancel only (partners cannot confirm payment — that's admin-side) */}
          {order.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <p className="text-sm text-amber-800 font-medium">결제 대기 중입니다</p>
              <Button
                variant="danger"
                size="md"
                className="w-full"
                onClick={() => setShowCancelModal(true)}
                loading={actionLoading}
              >
                주문 취소
              </Button>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm">이 주문은 취소되었습니다.</p>
            </div>
          )}

          {['processing', 'shipped', 'delivered'].includes(order.status) && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <OrderStatusBadge status={order.status} />
              <p className="text-teal-700 text-sm mt-2">현재 주문 상태입니다.</p>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && (
        <ConfirmModal
          title="주문 취소"
          message="이 주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmLabel="취소하기"
          onConfirm={handleCancel}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </div>
  )
}
