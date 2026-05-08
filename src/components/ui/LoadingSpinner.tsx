type Size = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
}

interface LoadingSpinnerProps {
  size?: Size
  className?: string
  centered?: boolean
}

export default function LoadingSpinner({ size = 'md', className = '', centered = false }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`${SIZE_CLASSES[size]} border-teal-600 border-t-transparent rounded-full animate-spin ${className}`}
    />
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center py-12">
        {spinner}
      </div>
    )
  }

  return spinner
}
