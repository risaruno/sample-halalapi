import { ShoppingCart, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useLanguage } from '../../contexts/LanguageContext'
import type { Product } from '../../types'
import PriceTag from '../ui/PriceTag'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCartStore()
  const { lang, t } = useLanguage()
  const navigate = useNavigate()
  const inCart = items.some((i) => i.product.id === product.id)
  const outOfStock = product.stock_qty === 0

  const displayName = product.translations?.[lang] ?? product.name

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product)
    toast.success(t.products.addedToCart(displayName))
  }

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Product image */}
      <div className="relative h-44 bg-gray-50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_halal && (
            <span className="bg-teal-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
              🌙 {t.products.halal}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-sm font-bold px-3 py-1 rounded-full">
              {t.products.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-teal-600 font-medium mb-1">{product.category}</p>
        <h3 className="font-display font-semibold text-gray-900 text-sm leading-snug mb-3 line-clamp-2 flex-1">
          {displayName}
        </h3>

        {/* Pricing */}
        <div className="mb-3">
          {product.compare_at_price != null && product.compare_at_price > product.selling_price && (
            <PriceTag amount={product.compare_at_price} size="sm" strikethrough className="block" />
          )}
          <PriceTag amount={product.selling_price} size="lg" className="text-teal-700 block" />
        </div>

        {/* Stock badge */}
        {!outOfStock && product.stock_qty <= 10 && (
          <p className="text-xs text-amber-600 mb-2">{t.products.lowStock(product.stock_qty)}</p>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
            inCart
              ? 'bg-teal-50 text-teal-700 border border-teal-300 hover:bg-teal-100'
              : outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-teal-700 text-white hover:bg-teal-800'
          }`}
        >
          {inCart ? (
            <>
              <CheckCircle2 size={16} />
              {t.products.inCart}
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              {t.products.addToCart}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
