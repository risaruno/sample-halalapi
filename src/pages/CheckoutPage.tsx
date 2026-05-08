import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { DELIVERY_FEE, formatKRW } from '../lib/constants'
import { useLanguage } from '../contexts/LanguageContext'
import type { DaumPostcodeData } from '../types'
import api from '../lib/api'
import toast from 'react-hot-toast'
import CartItem from '../components/cart/CartItem'
import CartSummary from '../components/cart/CartSummary'
import Button from '../components/ui/Button'
import { MapPin } from 'lucide-react'

interface ShippingForm {
  line1: string
  line2: string
  city: string
  postal_code: string
  country: string
  notes: string
}

interface PlaceOrderBody {
  items: { product_id: string; quantity: number }[]
  shipping_addr: { line1: string; line2: string; city: string; postal_code: string; country: string }
  notes?: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCartStore()
  const { t } = useLanguage()
  const [placing, setPlacing] = useState(false)
  const [form, setForm] = useState<ShippingForm>({
    line1: '',
    line2: '',
    city: '',
    postal_code: '',
    country: 'KR',
    notes: '',
  })

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/products', { replace: true })
    return null
  }

  const openAddressSearch = () => {
    if (!window.daum?.Postcode) {
      toast.error(t.checkout.addressSearchUnavailable)
      return
    }
    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        setForm((prev) => ({
          ...prev,
          postal_code: data.zonecode,
          line1: data.roadAddress || data.address,
          city: `${data.sido} ${data.sigungu}`.trim(),
        }))
      },
    }).open()
  }

  const isValid =
    form.line1.trim() !== '' &&
    form.city.trim() !== '' &&
    form.postal_code.trim() !== ''

  const handlePlaceOrder = async () => {
    if (!isValid) {
      toast.error(t.checkout.addressRequired)
      return
    }
    setPlacing(true)
    try {
      const body: PlaceOrderBody = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        shipping_addr: {
          line1: form.line1,
          line2: form.line2.trim() || '-',
          city: form.city,
          postal_code: form.postal_code,
          country: form.country,
        },
      }
      if (form.notes.trim()) body.notes = form.notes.trim()

      const res = await api.post<{ success: boolean; data: { id: string; order_no: string } }>(
        '/v1/orders',
        body,
      )
      const newOrder = res.data.data
      clearCart()
      toast.success(t.checkout.successMsg(newOrder.order_no))
      navigate(`/orders/${newOrder.id}`)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as { message?: string })?.message ??
        t.checkout.errorMsg
      toast.error(msg)
    } finally {
      setPlacing(false)
    }
  }

  const field = (
    key: keyof ShippingForm,
    label: string,
    placeholder: string,
    opts?: { required?: boolean; readOnly?: boolean },
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={form[key]}
        readOnly={opts?.readOnly}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          opts?.readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'
        } border-gray-300`}
      />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">{t.checkout.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t.checkout.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Cart items */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-display font-semibold text-gray-900 mb-3">
              {t.checkout.orderItems(items.length)}
            </h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary + Shipping */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-display font-semibold text-gray-900 mb-3">{t.checkout.orderSummary}</h2>
            <CartSummary />
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span>{formatKRW(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.checkout.fixedDelivery}</span>
                <span>{formatKRW(DELIVERY_FEE)}</span>
              </div>
            </div>
          </div>

          {/* Shipping form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-display font-semibold text-gray-900 mb-4">{t.checkout.shippingInfo}</h2>

            <div className="space-y-3">
              {/* Address search button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.checkout.addressSearch} <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={openAddressSearch}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-teal-400 rounded-lg text-teal-700 font-medium text-sm hover:bg-teal-50 transition-colors"
                >
                  <MapPin size={16} />
                  {t.checkout.findAddress}
                </button>
              </div>

              {field('postal_code', t.checkout.postalCode, '12345', { required: true, readOnly: true })}
              {field('line1', t.checkout.addressLine1, t.checkout.addressLine1Placeholder, { required: true, readOnly: true })}
              {field('line2', t.checkout.addressLine2, t.checkout.addressLine2Placeholder, {})}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.checkout.notes}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder={t.checkout.notesPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-5"
              onClick={handlePlaceOrder}
              disabled={!isValid}
              loading={placing}
            >
              {t.checkout.placeOrder}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
