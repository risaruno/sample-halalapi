import { Package } from 'lucide-react'
import type { Order } from '../../types'
import OrderCard from './OrderCard'
import EmptyState from '../ui/EmptyState'
import { useNavigate } from 'react-router-dom'

interface OrderListProps {
  orders: Order[]
}

export default function OrderList({ orders }: OrderListProps) {
  const navigate = useNavigate()

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="주문 내역이 없습니다"
        description="아직 주문한 상품이 없습니다. 상품 목록에서 원하는 상품을 장바구니에 담아보세요."
        action={{ label: '상품 보러 가기', onClick: () => navigate('/products') }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
