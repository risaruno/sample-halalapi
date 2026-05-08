import type { OrderStatus } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'
import Badge from '../ui/Badge'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export default function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const { t } = useLanguage()
  return (
    <Badge variant={status} className={className}>
      {t.status[status] ?? status}
    </Badge>
  )
}
