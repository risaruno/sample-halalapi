import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import type { CartItem as CartItemType } from '../../types'
import { formatKRW } from '../../lib/constants'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQty, removeItem } = useCartStore()
  const { product, quantity } = item

  const hasRetailDiscount =
    product.compare_at_price != null && product.compare_at_price > product.selling_price
  const savingsPct = hasRetailDiscount
    ? Math.round((1 - product.selling_price / product.compare_at_price!) * 100)
    : 0

  return (
    <div className="flex gap-3 py-3">
      {/* Product image */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
            No img
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-500">{product.sku}</p>

        {/* Retail strikethrough + savings badge */}
        {hasRetailDiscount && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-gray-400 line-through">
              {formatKRW(product.compare_at_price!)}
            </span>
            <span className="text-xs font-medium text-rose-500">-{savingsPct}%</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1.5">
          {/* Qty controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateQty(product.id, quantity - 1)}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => updateQty(product.id, quantity + 1)}
              disabled={quantity >= product.stock_qty}
              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>
          <span className="text-sm font-semibold text-teal-700">
            {formatKRW(product.selling_price * quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(product.id)}
        className="text-gray-400 hover:text-red-500 transition-colors p-1 self-start"
        aria-label="Remove item"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
