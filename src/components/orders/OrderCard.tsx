import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import type { Order } from '../../types'
import { formatKRW } from '../../lib/constants'
import OrderStatusBadge from './OrderStatusBadge'
import Card from '../ui/Card'

interface OrderCardProps {
  order: Order
}

export default function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate()

  return (
    <Card onClick={() => navigate(`/orders/${order.id}`)} className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-bold text-gray-900 text-sm">
              #{order.order_no}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-500">
            {format(new Date(order.created_at), 'yyyy년 MM월 dd일 HH:mm')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            상품 {order.items?.length ?? '?'}종
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-bold text-teal-700 text-base">
            {formatKRW(order.total_amount)}
          </p>
        </div>
      </div>
    </Card>
  )
}
