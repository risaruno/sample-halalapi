import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, X, Upload, CheckCircle2, Circle, ChevronRight, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import type { Order, Product } from '../types'
import { formatKRW, DELIVERY_FEE } from '../lib/constants'
import { useLanguage } from '../contexts/LanguageContext'
import OrderStatusBadge from '../components/orders/OrderStatusBadge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel: string
  closeLabel: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ title, message, confirmLabel, closeLabel, confirmVariant = 'danger', onConfirm, onCancel }: ConfirmModalProps) {
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
            {closeLabel}
          </Button>
          <Button variant={confirmVariant} size="md" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Two-step progress indicator for the payment flow
function PaymentStepper({ step, labels }: { step: 1 | 2; labels: [string, string] }) {
  const done1 = step > 1
  const active1 = step === 1
  const active2 = step === 2
  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Step 1 */}
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${active1 ? 'text-amber-700' : done1 ? 'text-teal-600' : 'text-gray-400'}`}>
        {done1
          ? <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0" />
          : <Circle size={16} className={active1 ? 'text-amber-500' : 'text-gray-300'} />}
        <span className={`hidden sm:inline ${active1 ? 'underline underline-offset-2' : ''}`}>{labels[0]}</span>
      </div>
      <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
      {/* Step 2 */}
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${active2 ? 'text-teal-700' : 'text-gray-400'}`}>
        {active2
          ? <Circle size={16} className="text-teal-500" />
          : <Circle size={16} className="text-gray-300" />}
        <span className={`hidden sm:inline ${active2 ? 'underline underline-offset-2' : ''}`}>{labels[1]}</span>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [order, setOrder] = useState<Order | null>(null)
  const [compareAtMap, setCompareAtMap] = useState<Record<string, number | null>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Payment proof upload state
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showChangeProof, setShowChangeProof] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        t.orderDetail.errorLoad
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const handleCancel = async () => {
    if (!id) return
    setShowCancelModal(false)
    setActionLoading(true)
    try {
      await api.patch(`/v1/orders/${id}/cancel`)
      toast.success(t.orderDetail.successCancel)
      await fetchOrder()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        t.orderDetail.errorCancel
      toast.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setProofFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setProofPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setProofPreview(null)
    }
  }

  const handleProofUpload = async (e: React.FormEvent, isChange = false) => {
    e.preventDefault()
    if (!id || !proofFile) return
    setUploadError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      await api.post(`/v1/orders/${id}/payment-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(isChange ? t.orderDetail.proofChangeSuccess : t.orderDetail.proofSuccess)
      setProofFile(null)
      setProofPreview(null)
      setShowChangeProof(false)
      await fetchOrder()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        t.orderDetail.proofError
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingSpinner centered />

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-semibold mb-1">{t.orderDetail.error}</p>
          <p className="text-sm">{error ?? t.orderDetail.orderNotFound}</p>
          <button className="mt-3 text-sm underline" onClick={() => navigate('/orders')}>
            {t.orderDetail.backToOrders}
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

  const proof = order.payment_proof
  const hasProof = !!proof
  const stepperLabels: [string, string] = [t.orderDetail.proofStep1, t.orderDetail.proofStep2]

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
          <h2 className="font-display font-semibold text-gray-900 mb-4">{t.orderDetail.orderItems}</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[500px] px-4 sm:px-0">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="pb-2 pr-3 font-medium pl-4 sm:pl-0">{t.orderDetail.colProduct}</th>
                  <th className="pb-2 pr-3 font-medium text-center">{t.orderDetail.colQty}</th>
                  <th className="pb-2 pr-3 font-medium text-right">{t.orderDetail.colRetailPrice}</th>
                  <th className="pb-2 pr-3 font-medium text-right">{t.orderDetail.colSellingPrice}</th>
                  <th className="pb-2 font-medium text-right pr-4 sm:pr-0">{t.orderDetail.colLineTotal}</th>
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
            <h2 className="font-display font-semibold text-gray-900 mb-3">{t.orderDetail.paymentSummary}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t.orderDetail.subtotal}</span>
                <span>{formatKRW(customerSubtotal)}</span>
              </div>
              {totalRetailSavings > 0 && (
                <div className="flex justify-between text-rose-500 font-medium">
                  <span>{t.orderDetail.savingsVsRetail}</span>
                  <span>-{formatKRW(totalRetailSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{t.orderDetail.delivery}</span>
                <span>{formatKRW(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-base">
                <span>{t.orderDetail.total}</span>
                <span className="text-teal-700">{formatKRW(customerSubtotal + deliveryFee)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_addr && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-display font-semibold text-gray-900 mb-2">{t.orderDetail.shippingAddress}</h2>
              <div className="text-sm text-gray-600 space-y-0.5">
                {order.shipping_addr.name && (
                  <p className="font-medium text-gray-800">
                    {order.shipping_addr.name}
                    {order.shipping_addr.phone && (
                      <span className="ml-2 font-normal text-gray-500">{order.shipping_addr.phone}</span>
                    )}
                  </p>
                )}
                <p>{order.shipping_addr.line1}</p>
                {order.shipping_addr.line2 && <p>{order.shipping_addr.line2}</p>}
                <p>{order.shipping_addr.city} {order.shipping_addr.postal_code}</p>
                <p>{order.shipping_addr.country}</p>
              </div>
            </div>
          )}

          {/* ── Pending: payment flow ── */}
          {order.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <PaymentStepper step={hasProof ? 2 : 1} labels={stepperLabels} />

              {!hasProof ? (
                /* ── Step 1: Upload proof ── */
                <form onSubmit={(e) => { void handleProofUpload(e, false) }} className="space-y-3">
                  <h3 className="font-display font-semibold text-gray-800 text-sm">{t.orderDetail.proofTitle}</h3>

                  {/* File drop area */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t.orderDetail.proofImage}</label>
                    <div
                      className="border-2 border-dashed border-amber-300 rounded-lg overflow-hidden cursor-pointer hover:border-teal-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {proofPreview ? (
                        <img
                          src={proofPreview}
                          alt="Preview"
                          className="w-full max-h-40 object-contain bg-gray-50"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400 py-5">
                          <Upload size={22} />
                          <p className="text-xs">{t.orderDetail.proofImageHint}</p>
                        </div>
                      )}
                    </div>
                    {proofFile && (
                      <p className="text-xs text-teal-700 mt-1 truncate">{proofFile.name}</p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{uploadError}</p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    loading={uploading}
                    disabled={!proofFile}
                  >
                    {t.orderDetail.proofSubmit}
                  </Button>
                </form>
              ) : (
                /* ── Step 2: Awaiting admin confirmation ── */
                <div className="space-y-4">
                  {showChangeProof ? (
                    /* ── Change proof form ── */
                    <form onSubmit={(e) => { void handleProofUpload(e, true) }} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-semibold text-gray-800 text-sm">{t.orderDetail.proofTitle}</h3>
                        <button
                          type="button"
                          onClick={() => { setShowChangeProof(false); setProofFile(null); setProofPreview(null); setUploadError(null) }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">{t.orderDetail.proofChangeHint}</p>

                      {/* File drop area */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t.orderDetail.proofImage}</label>
                        <div
                          className="border-2 border-dashed border-amber-300 rounded-lg overflow-hidden cursor-pointer hover:border-teal-400 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {proofPreview ? (
                            <img src={proofPreview} alt="Preview" className="w-full max-h-40 object-contain bg-gray-50" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-gray-400 py-5">
                              <Upload size={22} />
                              <p className="text-xs">{t.orderDetail.proofImageHint}</p>
                            </div>
                          )}
                        </div>
                        {proofFile && (
                          <p className="text-xs text-teal-700 mt-1 truncate">{proofFile.name}</p>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>

                      {uploadError && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{uploadError}</p>
                      )}

                      <Button type="submit" variant="primary" size="md" className="w-full" loading={uploading} disabled={!proofFile}>
                        {t.orderDetail.proofSubmit}
                      </Button>
                    </form>
                  ) : (
                    /* ── Proof preview card ── */
                    <>
                      <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
                        <a href={proof.image_url} target="_blank" rel="noopener noreferrer" className="block group relative">
                          <img
                            src={proof.image_url}
                            alt="Payment proof"
                            className="w-full max-h-48 object-contain bg-gray-50"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" />
                          </div>
                        </a>
                        <div className="px-4 py-3 text-sm border-t border-gray-100">
                          <div className="flex justify-between items-baseline">
                            <span className="text-gray-400 text-xs">{t.orderDetail.proofSubmittedAt}</span>
                            <span className="text-gray-400 text-xs">
                              {format(new Date(proof.submitted_at), 'yyyy-MM-dd HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100 rounded-lg px-3 py-2.5">
                        <span>🟡</span>
                        <span>{t.orderDetail.proofConfirmHint}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowChangeProof(true)}
                        className="w-full text-xs text-gray-500 hover:text-teal-700 underline underline-offset-2 transition-colors text-center"
                      >
                        {t.orderDetail.proofChange}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Cancel order — always shown at bottom */}
              <div className="mt-4 pt-4 border-t border-amber-200">
                <Button
                  variant="danger"
                  size="md"
                  className="w-full"
                  onClick={() => setShowCancelModal(true)}
                  loading={actionLoading}
                  disabled={actionLoading}
                >
                  {t.orderDetail.cancelOrder}
                </Button>
              </div>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-sm">{t.orderDetail.orderCancelled}</p>
            </div>
          )}

          {['processing', 'shipped', 'delivered'].includes(order.status) && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <OrderStatusBadge status={order.status} />
              <p className="text-teal-700 text-sm mt-2">{t.orderDetail.currentStatus}</p>
            </div>
          )}

          {/* Payment proof card — shown for any non-pending status when proof exists */}
          {proof && order.status !== 'pending' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-display font-semibold text-gray-900 text-sm">{t.orderDetail.proofTitle}</h2>
              </div>
              <a href={proof.image_url} target="_blank" rel="noopener noreferrer" className="block group relative">
                <img
                  src={proof.image_url}
                  alt="Payment proof"
                  className="w-full max-h-48 object-contain bg-gray-50"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" />
                </div>
              </a>
              <div className="px-4 py-3 space-y-2 text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400 text-xs">{t.orderDetail.proofSubmittedAt}</span>
                  <span className="text-gray-400 text-xs">
                    {format(new Date(proof.submitted_at), 'yyyy-MM-dd HH:mm')}
                  </span>
                </div>
                {proof.admin_confirmed ? (
                  <div className="flex items-center gap-1.5 text-teal-700">
                    <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />
                    <span className="text-xs font-medium">{t.orderDetail.proofConfirmedBadge}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-700 text-xs">
                    <span>🟡</span>
                    <span>{t.orderDetail.proofPendingBadge}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && (
        <ConfirmModal
          title={t.orderDetail.cancelTitle}
          message={t.orderDetail.cancelMessage}
          confirmLabel={t.orderDetail.cancelConfirm}
          closeLabel={t.orderDetail.close}
          onConfirm={handleCancel}
          onCancel={() => setShowCancelModal(false)}
        />
      )}

    </div>
  )
}
