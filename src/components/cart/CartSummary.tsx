import { useCartStore } from '../../stores/cartStore'
import { useLanguage } from '../../contexts/LanguageContext'
import { DELIVERY_FEE, formatKRW } from '../../lib/constants'

export default function CartSummary() {
  const { subtotal, grandTotal, items } = useCartStore()
  const { t } = useLanguage()

  const totalRetailSavings = items.reduce((acc, { product, quantity }) => {
    if (product.compare_at_price != null && product.compare_at_price > product.selling_price) {
      return acc + (product.compare_at_price - product.selling_price) * quantity
    }
    return acc
  }, 0)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{t.cart.subtotal}</span>
        <span>{formatKRW(subtotal)}</span>
      </div>
      {totalRetailSavings > 0 && (
        <div className="flex justify-between text-sm text-rose-500 font-medium">
          <span>{t.cart.savingsVsRetail}</span>
          <span>-{formatKRW(totalRetailSavings)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm text-gray-600">
        <span>{t.cart.delivery}</span>
        <span>{formatKRW(DELIVERY_FEE)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
        <span>{t.cart.total}</span>
        <span className="text-teal-700">{formatKRW(grandTotal)}</span>
      </div>
    </div>
  )
}
