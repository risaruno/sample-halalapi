import { Package } from 'lucide-react'
import type { Order } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'
import OrderCard from './OrderCard'
import EmptyState from '../ui/EmptyState'
import { useNavigate } from 'react-router-dom'

interface OrderListProps {
  orders: Order[]
}

export default function OrderList({ orders }: OrderListProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package size={28} />}
        title={t.orders.empty}
        description={t.orders.emptyDesc}
        action={{ label: t.orders.goShopping, onClick: () => navigate('/products') }}
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
