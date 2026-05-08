import type { OrderStatus } from '../../types'
import Badge from '../ui/Badge'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    '결제 대기 (Awaiting Payment)',
  processing: '결제 확인 (Payment Confirmed)',
  shipped:    '배송 중 (Shipped)',
  delivered:  '배송 완료 (Delivered)',
  cancelled:  '취소됨 (Cancelled)',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge variant={status} className={className}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
