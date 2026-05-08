import { formatKRW } from '../../lib/constants'

type Size = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-bold',
}

interface PriceTagProps {
  amount: number
  size?: Size
  strikethrough?: boolean
  className?: string
  muted?: boolean
}

export default function PriceTag({
  amount,
  size = 'md',
  strikethrough = false,
  className = '',
  muted = false,
}: PriceTagProps) {
  return (
    <span
      className={`font-display ${SIZE_CLASSES[size]} ${
        strikethrough ? 'line-through text-gray-400' : ''
      } ${muted ? 'text-gray-400' : 'text-gray-900'} ${className}`}
    >
      {formatKRW(amount)}
    </span>
  )
}
