import type { ReactNode } from 'react'
import type { OrderStatus, Tier } from '../../types'

type BadgeVariant = 'default' | OrderStatus | Tier | 'success' | 'warning' | 'danger' | 'info'

const STYLES: Record<string, string> = {
  default:    'bg-gray-100 text-gray-700',
  success:    'bg-green-100 text-green-800',
  warning:    'bg-amber-100 text-amber-800',
  danger:     'bg-red-100 text-red-800',
  info:       'bg-blue-100 text-blue-800',
  // order statuses
  pending:    'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-gray-200 text-gray-600',
  // tiers
  Gold:   'bg-amber-100 text-amber-800 border border-amber-300',
  Silver: 'bg-gray-100 text-gray-700 border border-gray-300',
  Bronze: 'bg-orange-100 text-orange-800 border border-orange-300',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const style = STYLES[variant] ?? STYLES.default
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style} ${className}`}>
      {children}
    </span>
  )
}
