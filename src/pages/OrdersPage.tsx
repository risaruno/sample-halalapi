import { useOrders } from '../hooks/useOrders'
import OrderList from '../components/orders/OrderList'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function OrdersPage() {
  const { orders, loading, error } = useOrders()

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">주문 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? '주문 내역을 불러오는 중…' : `총 ${orders.length}건`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          오류: {error}
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
