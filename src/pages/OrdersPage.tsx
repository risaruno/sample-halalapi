import { useOrders } from '../hooks/useOrders'
import { useLanguage } from '../contexts/LanguageContext'
import OrderList from '../components/orders/OrderList'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function OrdersPage() {
  const { orders, loading, error } = useOrders()
  const { t } = useLanguage()

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">{t.orders.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? t.orders.loading : t.orders.count(orders.length)}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner centered />
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  )
}
